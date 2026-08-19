import express from "express";
import { pool, query } from "../db.js";
import { requireAdmin } from "./admin.js";
import { resolvePromo } from "../promoCodes.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = express.Router();

export const ORDER_STATUSES = ["pending", "paid", "shipped", "cancelled"];

// mirrors REQUIRED_FIELDS in the frontend's lib/checkoutFields.js
const REQUIRED_CUSTOMER_FIELDS = {
  name: "name",
  phone: "phone",
  address: "address",
  city: "city",
  postalCode: "postal code",
  governorate: "governorate",
  paymentMethod: "payment method",
};

function toOrderJSON(row) {
  return {
    id: row.id,
    customer: row.customer,
    items: row.items,
    subtotal: row.subtotal,
    promoCode: row.promo_code,
    discount: row.discount,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
  };
}

// POST /api/orders  (public — customer places an order from the cart)
// body: { customer: { name, phone, email?, address, city, postalCode, governorate, notes?, paymentMethod },
//         items: [{ id, qty }], promoCode? }
router.post("/", asyncHandler(async (req, res) => {
  const { customer, items, promoCode } = req.body;

  const missing = Object.entries(REQUIRED_CUSTOMER_FIELDS)
    .filter(([field]) => !String(customer?.[field] || "").trim())
    .map(([, label]) => label);
  if (missing.length) {
    return res.status(400).json({ error: `Missing customer details: ${missing.join(", ")}` });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty" });
  }
  if (items.some((i) => !Number.isInteger(i?.qty) || i.qty < 1)) {
    return res.status(400).json({ error: "Every item needs a whole quantity of at least 1" });
  }

  // Stock check, stock decrement and the order insert must be atomic, otherwise two
  // concurrent orders can both pass the check and oversell the last piece in stock.
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const ids = [...new Set(items.map((i) => i.id))];
    // FOR UPDATE locks these rows until the transaction commits.
    const { rows: products } = await client.query(
      "SELECT * FROM products WHERE id = ANY($1) FOR UPDATE",
      [ids]
    );

    let subtotal = 0;
    const orderItems = [];
    for (const { id, qty } of items) {
      const product = products.find((p) => p.id === id);
      if (!product) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Product not found" });
      }
      if ((product.stock ?? 0) < qty) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `"${product.name}" is out of stock` });
      }
      subtotal += product.price * qty;
      orderItems.push({ id, name: product.name, price: product.price, qty });
    }

    const promo = resolvePromo(promoCode, subtotal);
    const total = subtotal - (promo?.discount || 0);

    for (const { id, qty } of items) {
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [qty, id]);
    }

    const { rows } = await client.query(
      `INSERT INTO orders (customer, items, subtotal, promo_code, discount, total, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING *`,
      [JSON.stringify(customer), JSON.stringify(orderItems), subtotal, promo?.code || null, promo?.discount || 0, total]
    );

    await client.query("COMMIT");
    res.status(201).json(toOrderJSON(rows[0]));
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}));

// GET /api/orders  (admin only — view all orders)
router.get("/", requireAdmin, asyncHandler(async (req, res) => {
  const { rows } = await query("SELECT * FROM orders ORDER BY id");
  res.json(rows.map(toOrderJSON));
}));

// PUT /api/orders/:id/status  (admin only — update order status)
router.put("/:id/status", requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${ORDER_STATUSES.join(", ")}` });
  }
  const { rows } = await query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING *", [status, Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: "Order not found" });
  res.json(toOrderJSON(rows[0]));
}));

export default router;

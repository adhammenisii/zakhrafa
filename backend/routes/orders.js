import express from "express";
import { pool, query } from "../db.js";
import { requireAdmin } from "./admin.js";
import { resolvePromo } from "../promoCodes.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = express.Router();

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

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
      // in_stock is the admin's manual override; stock is the counted quantity.
      if (product.in_stock === false || (product.stock ?? 0) < qty) {
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

// GET /api/orders  (admin only)
// Optional filters: ?status=shipped &q=search &from=2026-08-01 &to=2026-08-31
router.get("/", requireAdmin, asyncHandler(async (req, res) => {
  const { status, q, from, to } = req.query;
  const where = [];
  const params = [];

  if (status && ORDER_STATUSES.includes(status)) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (from) {
    params.push(from);
    where.push(`created_at >= $${params.length}::date`);
  }
  if (to) {
    // Inclusive of the whole end day rather than midnight at its start.
    params.push(to);
    where.push(`created_at < ($${params.length}::date + interval '1 day')`);
  }
  if (q && String(q).trim()) {
    // Matches the order reference number, the customer's details, or any item name.
    params.push(`%${String(q).trim().toLowerCase()}%`);
    const p = `$${params.length}`;
    where.push(`(
      lower(customer->>'name') LIKE ${p}
      OR lower(customer->>'phone') LIKE ${p}
      OR lower(coalesce(customer->>'email','')) LIKE ${p}
      OR lower(coalesce(customer->>'city','')) LIKE ${p}
      OR lower(items::text) LIKE ${p}
      OR lower('ZKH-' || lpad(id::text, 5, '0')) LIKE ${p}
    )`);
  }

  const sql = `SELECT * FROM orders ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC`;
  const { rows } = await query(sql, params);
  res.json(rows.map(toOrderJSON));
}));

// PUT /api/orders/:id/status  (admin only)
// Cancelling returns the items to stock; un-cancelling takes them back out.
router.put("/:id/status", requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${ORDER_STATUSES.join(", ")}` });
  }
  const id = Number(req.params.id);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: currentRows } = await client.query("SELECT * FROM orders WHERE id = $1 FOR UPDATE", [id]);
    const current = currentRows[0];
    if (!current) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Order not found" });
    }

    const wasCancelled = current.status === "cancelled";
    const willBeCancelled = status === "cancelled";

    if (!wasCancelled && willBeCancelled) {
      for (const item of current.items) {
        await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [item.qty, item.id]);
      }
    } else if (wasCancelled && !willBeCancelled) {
      for (const item of current.items) {
        const { rows: stockRows } = await client.query(
          "SELECT name, stock FROM products WHERE id = $1 FOR UPDATE",
          [item.id]
        );
        // A product deleted since the order was placed simply has no stock to adjust.
        if (!stockRows[0]) continue;
        if (stockRows[0].stock < item.qty) {
          await client.query("ROLLBACK");
          return res.status(409).json({
            error: `Not enough stock to reopen this order — "${stockRows[0].name}" has ${stockRows[0].stock} left but the order needs ${item.qty}.`,
          });
        }
        await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [item.qty, item.id]);
      }
    }

    const { rows } = await client.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    await client.query("COMMIT");
    res.json(toOrderJSON(rows[0]));
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}));

export default router;

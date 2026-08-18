import express from "express";
import { query } from "../db.js";
import { requireAdmin } from "./admin.js";
import { resolvePromo } from "../promoCodes.js";

const router = express.Router();

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
// body: { customer: { name, phone, address }, items: [{ id, qty }], promoCode? }
router.post("/", async (req, res) => {
  const { customer, items, promoCode } = req.body;
  if (!customer?.name || !customer?.phone || !customer?.address) {
    return res.status(400).json({ error: "Missing customer details (name/phone/address)" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty" });
  }

  const ids = items.map((i) => i.id);
  const { rows: products } = await query("SELECT * FROM products WHERE id = ANY($1)", [ids]);

  let subtotal = 0;
  let orderItems;
  try {
    orderItems = items.map(({ id, qty }) => {
      const product = products.find((p) => p.id === id);
      if (!product) throw new Error("Product not found");
      if ((product.stock ?? 0) < qty) throw new Error(`"${product.name}" is out of stock`);
      subtotal += product.price * qty;
      return { id, name: product.name, price: product.price, qty };
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const promo = resolvePromo(promoCode, subtotal);
  const total = subtotal - (promo?.discount || 0);

  const { rows } = await query(
    `INSERT INTO orders (customer, items, subtotal, promo_code, discount, total, status)
     VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING *`,
    [JSON.stringify(customer), JSON.stringify(orderItems), subtotal, promo?.code || null, promo?.discount || 0, total]
  );

  res.status(201).json(toOrderJSON(rows[0]));
});

// GET /api/orders  (admin only — view all orders)
router.get("/", requireAdmin, async (req, res) => {
  const { rows } = await query("SELECT * FROM orders ORDER BY id");
  res.json(rows.map(toOrderJSON));
});

// PUT /api/orders/:id/status  (admin only — update order status)
router.put("/:id/status", requireAdmin, async (req, res) => {
  const { rows } = await query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING *", [req.body.status, Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: "Order not found" });
  res.json(toOrderJSON(rows[0]));
});

export default router;

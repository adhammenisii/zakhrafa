import express from "express";
import { query } from "../db.js";
import { resolvePromo } from "../promoCodes.js";

const router = express.Router();

// POST /api/promo/validate  (public — preview a promo code's discount before checkout)
// body: { code, items: [{ id, qty }] }
router.post("/validate", async (req, res) => {
  const { code, items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty" });
  }

  const ids = items.map((i) => i.id);
  const { rows: products } = await query("SELECT id, price FROM products WHERE id = ANY($1)", [ids]);
  const subtotal = items.reduce((sum, { id, qty }) => {
    const product = products.find((p) => p.id === id);
    return product ? sum + product.price * qty : sum;
  }, 0);

  const promo = resolvePromo(code, subtotal);
  if (!promo) return res.status(404).json({ error: "That promo code isn't valid for this order" });

  res.json(promo);
});

export default router;

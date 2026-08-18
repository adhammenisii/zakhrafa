import express from "express";
import { query } from "../db.js";
import { requireAdmin } from "./admin.js";

const router = express.Router();

// GET /api/products  (public — used by the storefront)
router.get("/", async (req, res) => {
  const { rows } = await query("SELECT * FROM products ORDER BY id");
  res.json(rows);
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  const { rows } = await query("SELECT * FROM products WHERE id = $1", [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: "Product not found" });
  res.json(rows[0]);
});

// POST /api/products  (admin only — add a new product)
router.post("/", requireAdmin, async (req, res) => {
  const { name, cat, price, img, stock, description } = req.body;
  if (!name || !cat || price == null) {
    return res.status(400).json({ error: "Name, category, and price are required" });
  }
  const { rows } = await query(
    `INSERT INTO products (name, cat, price, img, stock, description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, cat, Number(price), img || "", Number(stock) || 0, description || ""]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/products/:id  (admin only — edit a product)
router.put("/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { rows: existingRows } = await query("SELECT * FROM products WHERE id = $1", [id]);
  const existing = existingRows[0];
  if (!existing) return res.status(404).json({ error: "Product not found" });

  const merged = { ...existing, ...req.body };
  const { rows } = await query(
    `UPDATE products SET name=$1, cat=$2, price=$3, img=$4, stock=$5, description=$6 WHERE id=$7 RETURNING *`,
    [merged.name, merged.cat, merged.price, merged.img, merged.stock, merged.description, id]
  );
  res.json(rows[0]);
});

// DELETE /api/products/:id  (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  const { rowCount } = await query("DELETE FROM products WHERE id = $1", [Number(req.params.id)]);
  if (!rowCount) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
});

export default router;

import express from "express";
import { pool, query } from "../db.js";
import { requireAdmin } from "./admin.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = express.Router();

// Accepts either a real array or a single string, and drops empties — the panel sends
// an array, older callers sent one `img`.
function toImageList(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((v) => String(v).trim()).filter(Boolean).slice(0, 10);
}

function toInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

// GET /api/products  (public — used by the storefront)
// Returned in the admin's manual display order, oldest-first as a tiebreak.
router.get("/", asyncHandler(async (req, res) => {
  const { rows } = await query("SELECT * FROM products ORDER BY sort_order, id");
  res.json(rows);
}));

// GET /api/products/:id
router.get("/:id", asyncHandler(async (req, res) => {
  const { rows } = await query("SELECT * FROM products WHERE id = $1", [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: "Product not found" });
  res.json(rows[0]);
}));

// POST /api/products  (admin only — add a new product)
router.post("/", requireAdmin, asyncHandler(async (req, res) => {
  const { name, cat, price, stock, description, featured, inStock } = req.body;
  if (!String(name || "").trim()) return res.status(400).json({ error: "Product name is required" });
  if (!String(cat || "").trim()) return res.status(400).json({ error: "Category is required" });
  if (price == null || !Number.isFinite(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: "Price must be a number of 0 or more" });
  }

  const images = toImageList(req.body.images ?? req.body.img);
  const { rows: max } = await query("SELECT COALESCE(MAX(sort_order),0)::int AS max FROM products");

  const { rows } = await query(
    `INSERT INTO products (name, cat, price, img, images, stock, description, featured, in_stock, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      String(name).trim(),
      String(cat).trim(),
      toInt(price),
      images[0] || "",
      images.length ? JSON.stringify(images) : null,
      Math.max(0, toInt(stock)),
      String(description || "").trim(),
      Boolean(featured),
      inStock === undefined ? true : Boolean(inStock),
      max[0].max + 1,
    ]
  );
  res.status(201).json(rows[0]);
}));

// PUT /api/products/:id  (admin only — edit a product)
router.put("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { rows: existingRows } = await query("SELECT * FROM products WHERE id = $1", [id]);
  const existing = existingRows[0];
  if (!existing) return res.status(404).json({ error: "Product not found" });

  const body = req.body || {};
  const name = body.name !== undefined ? String(body.name).trim() : existing.name;
  if (!name) return res.status(400).json({ error: "Product name is required" });

  const cat = body.cat !== undefined ? String(body.cat).trim() : existing.cat;
  if (!cat) return res.status(400).json({ error: "Category is required" });

  const price = body.price !== undefined ? toInt(body.price, existing.price) : existing.price;
  if (price < 0) return res.status(400).json({ error: "Price must be a number of 0 or more" });

  const stock = body.stock !== undefined ? Math.max(0, toInt(body.stock, existing.stock)) : existing.stock;
  const description = body.description !== undefined ? String(body.description).trim() : existing.description;
  const featured = body.featured !== undefined ? Boolean(body.featured) : existing.featured;
  const inStock = body.inStock !== undefined ? Boolean(body.inStock) : existing.in_stock;

  const images =
    body.images !== undefined || body.img !== undefined
      ? toImageList(body.images ?? body.img)
      : toImageList(existing.images ?? existing.img);

  const { rows } = await query(
    `UPDATE products SET name=$1, cat=$2, price=$3, img=$4, images=$5, stock=$6, description=$7,
            featured=$8, in_stock=$9
     WHERE id=$10 RETURNING *`,
    [
      name,
      cat,
      price,
      images[0] || "",
      images.length ? JSON.stringify(images) : null,
      stock,
      description,
      featured,
      inStock,
      id,
    ]
  );
  res.json(rows[0]);
}));

// PUT /api/products/order/all  (admin only)  body: { ids: [...] } — homepage display order
router.put("/order/all", requireAdmin, asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(id))) {
    return res.status(400).json({ error: "Expected a list of product ids" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const [i, id] of ids.entries()) {
      await client.query("UPDATE products SET sort_order = $1 WHERE id = $2", [i + 1, id]);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  const { rows } = await query("SELECT * FROM products ORDER BY sort_order, id");
  res.json(rows);
}));

// DELETE /api/products/:id  (admin only)
router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const { rowCount } = await query("DELETE FROM products WHERE id = $1", [Number(req.params.id)]);
  if (!rowCount) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
}));

export default router;

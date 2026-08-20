import express from "express";
import { pool, query } from "../db.js";
import { requireAdmin } from "./admin.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = express.Router();

// Slugs are used in product records and in storefront URLs (/?cat=oriental).
function toSlug(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/categories  (public — the storefront's category tiles and filter pills)
router.get("/", asyncHandler(async (req, res) => {
  const { rows } = await query("SELECT * FROM categories ORDER BY sort_order, id");
  res.json(rows);
}));

// POST /api/categories  (admin only)
router.post("/", requireAdmin, asyncHandler(async (req, res) => {
  const { label, img } = req.body;
  if (!String(label || "").trim()) return res.status(400).json({ error: "Category name is required" });

  const slug = toSlug(req.body.slug || label);
  if (!slug) return res.status(400).json({ error: "Category name must contain letters or numbers" });

  const { rows: existing } = await query("SELECT id FROM categories WHERE slug = $1", [slug]);
  if (existing[0]) return res.status(409).json({ error: `A category with the id "${slug}" already exists` });

  const { rows: max } = await query("SELECT COALESCE(MAX(sort_order),0)::int AS max FROM categories");
  const { rows } = await query(
    `INSERT INTO categories (slug, label, img, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
    [slug, String(label).trim(), img || null, max[0].max + 1]
  );
  res.status(201).json(rows[0]);
}));

// PUT /api/categories/:id  (admin only)
// Renaming the label is safe; changing the slug also rewrites every product pointing at it.
router.put("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { rows: existingRows } = await query("SELECT * FROM categories WHERE id = $1", [id]);
  const existing = existingRows[0];
  if (!existing) return res.status(404).json({ error: "Category not found" });

  const label = req.body.label !== undefined ? String(req.body.label).trim() : existing.label;
  if (!label) return res.status(400).json({ error: "Category name is required" });
  const img = req.body.img !== undefined ? req.body.img : existing.img;
  const slug = req.body.slug !== undefined ? toSlug(req.body.slug) : existing.slug;
  if (!slug) return res.status(400).json({ error: "Category id must contain letters or numbers" });

  if (slug !== existing.slug) {
    const { rows: clash } = await query("SELECT id FROM categories WHERE slug = $1 AND id <> $2", [slug, id]);
    if (clash[0]) return res.status(409).json({ error: `A category with the id "${slug}" already exists` });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE categories SET slug=$1, label=$2, img=$3 WHERE id=$4 RETURNING *`,
      [slug, label, img, id]
    );
    if (slug !== existing.slug) {
      await client.query("UPDATE products SET cat = $1 WHERE cat = $2", [slug, existing.slug]);
    }
    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}));

// PUT /api/categories/reorder  (admin only)  body: { ids: [3, 1, 2] }
router.put("/order/all", requireAdmin, asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(id))) {
    return res.status(400).json({ error: "Expected a list of category ids" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const [i, id] of ids.entries()) {
      await client.query("UPDATE categories SET sort_order = $1 WHERE id = $2", [i + 1, id]);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  const { rows } = await query("SELECT * FROM categories ORDER BY sort_order, id");
  res.json(rows);
}));

// DELETE /api/categories/:id  (admin only)
// Refused while products still use it, so nothing silently disappears from the shop.
router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { rows: existingRows } = await query("SELECT * FROM categories WHERE id = $1", [id]);
  const existing = existingRows[0];
  if (!existing) return res.status(404).json({ error: "Category not found" });

  const { rows: used } = await query("SELECT COUNT(*)::int AS count FROM products WHERE cat = $1", [existing.slug]);
  if (used[0].count > 0) {
    return res.status(409).json({
      error: `${used[0].count} product(s) still use this category. Move them to another category first.`,
    });
  }

  await query("DELETE FROM categories WHERE id = $1", [id]);
  res.json({ ok: true });
}));

export default router;

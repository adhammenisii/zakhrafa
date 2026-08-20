import express from "express";
import multer from "multer";
import { query } from "../db.js";
import { requireAdmin } from "./admin.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = express.Router();

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

// Uploads are held in memory and written straight to Postgres — Render's disk is
// ephemeral, so a file saved to it would vanish on the next deploy.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 10 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WebP, GIF, and SVG images are allowed"));
    }
    cb(null, true);
  },
});

// POST /api/media  (admin only) — multipart form, field name "images", up to 10 at once.
router.post("/", requireAdmin, upload.array("images", 10), asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (files.length === 0) return res.status(400).json({ error: "No image was uploaded" });

  const saved = [];
  for (const file of files) {
    const { rows } = await query(
      `INSERT INTO media (filename, mime, size, data) VALUES ($1,$2,$3,$4) RETURNING id, filename, mime, size`,
      [file.originalname, file.mimetype, file.size, file.buffer]
    );
    saved.push({ ...rows[0], url: `/api/media/${rows[0].id}` });
  }

  res.status(201).json(saved);
}));

// GET /api/media  (admin only) — the library, without the binary payloads.
router.get("/", requireAdmin, asyncHandler(async (req, res) => {
  const { rows } = await query("SELECT id, filename, mime, size, created_at FROM media ORDER BY id DESC");
  res.json(rows.map((r) => ({ ...r, url: `/api/media/${r.id}` })));
}));

// GET /api/media/:id  (public — this is what <img src> hits)
router.get("/:id", asyncHandler(async (req, res) => {
  const { rows } = await query("SELECT mime, data FROM media WHERE id = $1", [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: "Image not found" });

  res.setHeader("Content-Type", rows[0].mime);
  // Rows are immutable once written (a replacement gets a new id), so this can cache hard.
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.send(rows[0].data);
}));

// DELETE /api/media/:id  (admin only)
router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const { rowCount } = await query("DELETE FROM media WHERE id = $1", [Number(req.params.id)]);
  if (!rowCount) return res.status(404).json({ error: "Image not found" });
  res.json({ ok: true });
}));

// Multer reports oversized files and rejected types by throwing — turn those into
// the same JSON shape every other route returns.
router.use((err, req, res, next) => {
  if (!err) return next();
  const tooBig = err.code === "LIMIT_FILE_SIZE";
  res.status(400).json({
    error: tooBig ? "Each image must be 5 MB or smaller" : err.message || "Upload failed",
  });
});

export default router;

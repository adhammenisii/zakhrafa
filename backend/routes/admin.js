import express from "express";
import jwt from "jsonwebtoken";
import { query } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { verifyPassword, setPassword, passwordProblem, loginThrottle } from "../lib/auth.js";

const router = express.Router();

// Short-lived by design: the panel silently refreshes it while you're active, so an
// idle session stops working roughly half an hour after the last thing you did.
const SESSION_TTL = "30m";

function issueToken() {
  return jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: SESSION_TTL });
}

// Middleware to protect admin-only routes.
export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "Admin login required" });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Session expired, please log in again" });
  }
}

// POST /api/admin/login  { password }
router.post("/login", loginThrottle, asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!(await verifyPassword(password))) {
    res.locals.recordLoginFailure();
    // Deliberately identical for a missing, malformed, or simply wrong password —
    // nothing here should help someone work out what part they got right.
    return res.status(401).json({ error: "Incorrect password" });
  }

  res.locals.clearLoginFailures();
  res.json({ token: issueToken() });
}));

// POST /api/admin/refresh — slides the session forward while the admin is active.
router.post("/refresh", requireAdmin, (req, res) => {
  res.json({ token: issueToken() });
});

// GET /api/admin/me — lets the panel confirm a stored token is still valid on load.
router.get("/me", requireAdmin, (req, res) => {
  res.json({ ok: true });
});

// POST /api/admin/password  { currentPassword, newPassword }
router.post("/password", requireAdmin, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!(await verifyPassword(currentPassword))) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }
  const problem = passwordProblem(newPassword);
  if (problem) return res.status(400).json({ error: problem });
  if (currentPassword === newPassword) {
    return res.status(400).json({ error: "New password must be different from the current one" });
  }

  await setPassword(newPassword);
  // Re-issue so the admin isn't logged out by their own password change.
  res.json({ ok: true, token: issueToken() });
}));

// GET /api/admin/stats — dashboard numbers.
router.get("/stats", requireAdmin, asyncHandler(async (req, res) => {
  const [totals, today, week, bestSellers, lowStock, recent] = await Promise.all([
    query(`SELECT COUNT(*)::int AS orders, COALESCE(SUM(total),0)::int AS revenue
           FROM orders WHERE status <> 'cancelled'`),
    query(`SELECT COUNT(*)::int AS orders, COALESCE(SUM(total),0)::int AS revenue
           FROM orders WHERE status <> 'cancelled' AND created_at >= date_trunc('day', now())`),
    query(`SELECT COUNT(*)::int AS orders, COALESCE(SUM(total),0)::int AS revenue
           FROM orders WHERE status <> 'cancelled' AND created_at >= now() - interval '7 days'`),
    query(`SELECT item->>'name' AS name, SUM((item->>'qty')::int)::int AS qty
           FROM orders, jsonb_array_elements(items) AS item
           WHERE status <> 'cancelled'
           GROUP BY 1 ORDER BY qty DESC, name ASC LIMIT 5`),
    query(`SELECT id, name, stock FROM products WHERE stock <= 2 ORDER BY stock ASC, name ASC`),
    query(`SELECT COUNT(*)::int AS pending FROM orders WHERE status = 'pending'`),
  ]);

  res.json({
    allTime: totals.rows[0],
    today: today.rows[0],
    week: week.rows[0],
    bestSellers: bestSellers.rows,
    lowStock: lowStock.rows,
    pendingOrders: recent.rows[0].pending,
  });
}));

// GET /api/admin/backup — everything the site holds, as one downloadable JSON file.
router.get("/backup", requireAdmin, asyncHandler(async (req, res) => {
  const [products, orders, messages, categories, faqs, settings, media] = await Promise.all([
    query("SELECT * FROM products ORDER BY id"),
    query("SELECT * FROM orders ORDER BY id"),
    query("SELECT * FROM messages ORDER BY id"),
    query("SELECT * FROM categories ORDER BY sort_order, id"),
    query("SELECT * FROM faqs ORDER BY sort_order, id"),
    // The password hash is deliberately excluded — a backup file shouldn't carry it.
    query("SELECT key, value, updated_at FROM settings WHERE key <> 'admin_password_hash' ORDER BY key"),
    query("SELECT id, filename, mime, size, encode(data, 'base64') AS data_base64, created_at FROM media ORDER BY id"),
  ]);

  const stamp = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="zakhrafa-backup-${stamp}.json"`);
  res.json({
    exportedAt: new Date().toISOString(),
    version: 1,
    products: products.rows,
    orders: orders.rows,
    messages: messages.rows,
    categories: categories.rows,
    faqs: faqs.rows,
    settings: settings.rows,
    media: media.rows,
  });
}));

export default router;

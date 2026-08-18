import express from "express";
import { query } from "../db.js";
import { requireAdmin } from "./admin.js";

const router = express.Router();

function toMessageJSON(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
  };
}

// POST /api/contact  (public — customer sends a message from the Contact Us page)
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }

  const { rows } = await query(
    `INSERT INTO messages (name, email, subject, message) VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, email, subject || "", message]
  );

  res.status(201).json(toMessageJSON(rows[0]));
});

// GET /api/contact  (admin only — view all messages)
router.get("/", requireAdmin, async (req, res) => {
  const { rows } = await query("SELECT * FROM messages ORDER BY id");
  res.json(rows.map(toMessageJSON));
});

// DELETE /api/contact/:id  (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  const { rowCount } = await query("DELETE FROM messages WHERE id = $1", [Number(req.params.id)]);
  if (!rowCount) return res.status(404).json({ error: "Message not found" });
  res.json({ ok: true });
});

export default router;

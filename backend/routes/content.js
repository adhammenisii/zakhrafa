import express from "express";
import { pool, query, getSetting, setSetting } from "../db.js";
import { requireAdmin } from "./admin.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = express.Router();

const str = (v, fallback = "") => (typeof v === "string" ? v.trim() : fallback);

// Each section is normalised on the way in, so a missing or misspelled field from the
// panel can never leave the storefront rendering `undefined`.
const SECTIONS = {
  hero: (body, current) => ({
    eyebrow: str(body.eyebrow, current.eyebrow),
    title: str(body.title, current.title) || current.title,
    subtitle: str(body.subtitle, current.subtitle),
    ctaLabel: str(body.ctaLabel, current.ctaLabel) || "Shop the Collection",
    image: str(body.image, current.image) || current.image,
  }),
  about: (body, current) => ({
    heroImage: str(body.heroImage, current.heroImage) || current.heroImage,
    intro: str(body.intro, current.intro),
    storyTitle: str(body.storyTitle, current.storyTitle),
    storyText: str(body.storyText, current.storyText),
    cards: Array.isArray(body.cards)
      ? body.cards.slice(0, 6).map((card, i) => ({
          title: str(card?.title, current.cards?.[i]?.title || ""),
          body: str(card?.body, current.cards?.[i]?.body || ""),
          image: str(card?.image, current.cards?.[i]?.image || ""),
        }))
      : current.cards,
  }),
  contact: (body, current) => ({
    email: str(body.email, current.email),
    // Digits only — this gets pasted straight into a wa.me link.
    whatsapp: str(body.whatsapp, current.whatsapp).replace(/[^\d]/g, ""),
    instagram: str(body.instagram, current.instagram),
    facebook: str(body.facebook, current.facebook),
    responseTime: str(body.responseTime, current.responseTime),
  }),
};

// GET /api/content  (public — the storefront reads hero copy, about text, contact info, FAQs)
router.get("/", asyncHandler(async (req, res) => {
  const [hero, about, contact, faqs] = await Promise.all([
    getSetting("hero", {}),
    getSetting("about", {}),
    getSetting("contact", {}),
    query("SELECT id, question, answer FROM faqs ORDER BY sort_order, id"),
  ]);
  res.json({ hero, about, contact, faqs: faqs.rows });
}));

// PUT /api/content/:section  (admin only) — section is hero, about, or contact
router.put("/:section", requireAdmin, asyncHandler(async (req, res) => {
  const { section } = req.params;
  const normalise = SECTIONS[section];
  if (!normalise) {
    return res.status(404).json({ error: `Unknown content section "${section}"` });
  }

  const current = (await getSetting(section)) || {};
  const value = normalise(req.body || {}, current);
  await setSetting(section, value);
  res.json(value);
}));

// --- FAQs -------------------------------------------------------------------

// POST /api/content/faqs  (admin only)
router.post("/faqs/new", requireAdmin, asyncHandler(async (req, res) => {
  const question = str(req.body.question);
  const answer = str(req.body.answer);
  if (!question || !answer) return res.status(400).json({ error: "Both a question and an answer are required" });

  const { rows: max } = await query("SELECT COALESCE(MAX(sort_order),0)::int AS max FROM faqs");
  const { rows } = await query(
    `INSERT INTO faqs (question, answer, sort_order) VALUES ($1,$2,$3) RETURNING id, question, answer`,
    [question, answer, max[0].max + 1]
  );
  res.status(201).json(rows[0]);
}));

// PUT /api/content/faqs/:id  (admin only)
router.put("/faqs/:id", requireAdmin, asyncHandler(async (req, res) => {
  const question = str(req.body.question);
  const answer = str(req.body.answer);
  if (!question || !answer) return res.status(400).json({ error: "Both a question and an answer are required" });

  const { rows } = await query(
    `UPDATE faqs SET question=$1, answer=$2 WHERE id=$3 RETURNING id, question, answer`,
    [question, answer, Number(req.params.id)]
  );
  if (!rows[0]) return res.status(404).json({ error: "Question not found" });
  res.json(rows[0]);
}));

// PUT /api/content/faqs/order/all  (admin only)  body: { ids: [...] }
router.put("/faqs/order/all", requireAdmin, asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.some((id) => !Number.isInteger(id))) {
    return res.status(400).json({ error: "Expected a list of question ids" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const [i, id] of ids.entries()) {
      await client.query("UPDATE faqs SET sort_order = $1 WHERE id = $2", [i + 1, id]);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  const { rows } = await query("SELECT id, question, answer FROM faqs ORDER BY sort_order, id");
  res.json(rows);
}));

// DELETE /api/content/faqs/:id  (admin only)
router.delete("/faqs/:id", requireAdmin, asyncHandler(async (req, res) => {
  const { rowCount } = await query("DELETE FROM faqs WHERE id = $1", [Number(req.params.id)]);
  if (!rowCount) return res.status(404).json({ error: "Question not found" });
  res.json({ ok: true });
}));

export default router;

import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export function query(text, params) {
  return pool.query(text, params);
}

const SEED_PRODUCTS = [
  ["Golden Nefertiti Panel", "pharaonic", 980, "/images/products/nefertari.jpg", null, 4, "A fully hand-painted and gilded canvas piece featuring an authentic Pharaonic design of Nefertiti among hieroglyphic motifs."],
  ["Arabesque Engraved Panel", "oriental", 1150, "/images/products/panel.jpg", null, 3, "A raised wooden panel with a floral arabesque pattern, hand-finished with a weathered copper-patina effect."],
  ["Ramadan Domes Decor Set", "ramadan", 620, "/images/products/ramadan.jpg", null, 8, "A wooden decor set of gilded domes and a crescent moon, perfect for styling your Ramadan table."],
  ["The Antique Majlis Table", "oriental", 1750, "/images/products/tray.jpg", JSON.stringify(["/images/products/tray.jpg", "/images/products/tray-hero.jpg"]), 2, "A round table hand-painted with an antique oriental still-life scene, set on a solid wood pedestal base."],
  ["Custom Mosaic Mirror", "mosaic", 1450, "/images/products/mosaic-tiles.jpg", null, 5, "A wooden mirror framed with hand-painted mosaic tiles, made piece by piece — colors and size made to order."],
];

// Mirrors the list the storefront used to hardcode in frontend/src/lib/constants.js.
const SEED_CATEGORIES = [
  ["mosaic", "Mosaic Mirrors", "/images/products/mosaic-tiles.jpg", 1],
  ["pharaonic", "Pharaonic Art", "/images/products/nefertari.jpg", 2],
  ["ramadan", "Occasion Decor", "/images/products/ramadan.jpg", 3],
  ["oriental", "Oriental Panels", "/images/products/tray.jpg", 4],
];

// Mirrors the list the storefront used to hardcode in frontend/src/pages/FaqPage.jsx.
const SEED_FAQS = [
  ["Is every piece really handmade?", "Yes — every panel, mirror, and decor piece is hand-painted, carved, or assembled by hand in our workshop. Nothing is printed or mass-produced, so small variations in color and texture are part of each piece's character, not a flaw."],
  ["How long does an order take to arrive?", "Orders are typically prepared and shipped within 3–5 business days. Delivery across Egypt usually takes an additional 2–4 business days depending on your location."],
  ["Do you ship outside Egypt?", "At the moment we ship within Egypt only. If you're reaching out from abroad, message us on Instagram or through the Contact page and we'll see what we can arrange."],
  ["Can I order a custom design or size?", "Many of our pieces — especially the mosaic mirrors — can be customized in color and size. Reach out via the Contact page with what you have in mind and we'll let you know what's possible."],
  ["What payment methods do you accept?", "You can place an order directly through the site. Online card payment is available once checkout is completed; if it isn't active yet, we'll contact you directly to confirm payment after your order comes through."],
  ["What if my item arrives damaged?", "Contact us within 48 hours of delivery with a photo of the item and packaging, and we'll sort out a replacement or refund."],
  ["How should I care for a handmade wooden piece?", "Keep pieces away from direct sunlight and moisture, and dust gently with a soft, dry cloth. Avoid harsh chemical cleaners on painted or gilded surfaces."],
];

// Mirrors the copy the storefront used to hardcode in its page components.
const SEED_SETTINGS = {
  hero: {
    eyebrow: "HANDMADE · EGYPT",
    title: "Where Wood Meets Art",
    subtitle: "Oriental and Pharaonic-inspired wooden pieces, painted and finished entirely by hand — for an authentic touch in your space.",
    ctaLabel: "Shop the Collection",
    image: "/images/products/tray-hero.jpg",
  },
  about: {
    heroImage: "/images/products/panel.jpg",
    intro: "Zakhrafa started with a simple passion for wood and color. What began as one person's love for hand-painting and carving grew, piece by piece, into a small workshop dedicated to turning raw wood into art. Today every panel, mirror, and decor piece we make is still shaped entirely by hand — no printing, no molds, no mass production — so no two pieces are ever quite the same.",
    storyTitle: "Handmade with Heart",
    storyText: "Zakhrafa started with a simple passion for wood and color, and grew into a small workshop turning raw material into art. Every piece is shaped by brush and chisel — no printing, no mass production — inspired by Egypt's layered Pharaonic and Oriental heritage.",
    cards: [
      { title: "What is Zakhrafa?", body: "Zakhrafa is an Egyptian brand dedicated to fully handmade wooden pieces — painted panels, mosaic mirrors, and occasion decor. Every piece is hand-painted and finished by a craftsperson, so no two pieces are ever quite the same.", image: "/images/products/mosaic-tiles.jpg" },
      { title: "Who's Behind Zakhrafa?", body: "A passion for wood and color that grew into a small workshop turning raw material into art. Every design is shaped by brush and chisel — no printing, no mass production.", image: "/images/products/ramadan.jpg" },
      { title: "Why Zakhrafa?", body: "Our inspiration comes from Egypt's layered artistic heritage — Pharaonic and Oriental alike — translated into modern decor for your home, or a gift with a truly authentic identity.", image: "/images/products/nefertari.jpg" },
    ],
  },
  contact: {
    email: "hello@zakhrafa-handmade.com",
    whatsapp: "201000000000",
    instagram: "https://instagram.com/zakhrafa_handmade",
    facebook: "https://facebook.com/zakhrafahandmade",
    responseTime: "We usually reply within 1–2 business days.",
  },
};

// An arbitrary constant identifying this particular lock. Any process running
// ensureSchema() takes it, so only one of them can create and seed at a time.
const SCHEMA_LOCK_ID = 8241993;

// Creates tables if they don't exist yet and seeds content on a fresh database.
// Every statement is idempotent, so this is safe to run on every boot.
export async function ensureSchema() {
  // Held for the whole run, because "is the table empty?" followed by "insert the seed
  // rows" is only correct if nothing else can interleave between the two. Two instances
  // booting together — a rolling deploy, or a dev server restarting — would otherwise
  // both see an empty table and both insert a full set of seed rows.
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [SCHEMA_LOCK_ID]);
    await migrate(client);
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [SCHEMA_LOCK_ID]).catch(() => {});
    client.release();
  }
}

// Everything here runs on the one locked client, never on the shared pool.
async function migrate(client) {
  const query = (text, params) => client.query(text, params);

  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      cat TEXT NOT NULL,
      price INTEGER NOT NULL,
      img TEXT,
      images JSONB,
      stock INTEGER NOT NULL DEFAULT 0,
      description TEXT
    )
  `);

  // Added after the first release — existing databases get them via ALTER.
  await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false`);
  await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`);
  await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT true`);

  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer JSONB NOT NULL,
      items JSONB NOT NULL,
      subtotal INTEGER NOT NULL,
      promo_code TEXT,
      discount INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      img TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS faqs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Editable site copy and configuration, one row per section (hero, about, contact, ...).
  await query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  // Uploaded images live in Postgres rather than on disk: Render's filesystem is ephemeral,
  // so anything written there disappears on the next deploy.
  await query(`
    CREATE TABLE IF NOT EXISTS media (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      mime TEXT NOT NULL,
      size INTEGER NOT NULL,
      data BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  // Products predate the sort_order column, so give the existing ones a sensible
  // starting order instead of leaving them all on the default 0.
  await query(`UPDATE products SET sort_order = id WHERE sort_order = 0`);

  await seedIfEmpty(client, "products", SEED_PRODUCTS, (row, i) =>
    query(`INSERT INTO products (name, cat, price, img, images, stock, description, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [...row, i + 1])
  );

  await seedIfEmpty(client, "categories", SEED_CATEGORIES, (row) =>
    query(`INSERT INTO categories (slug, label, img, sort_order) VALUES ($1,$2,$3,$4)`, row)
  );

  await seedIfEmpty(client, "faqs", SEED_FAQS, (row, i) =>
    query(`INSERT INTO faqs (question, answer, sort_order) VALUES ($1,$2,$3)`, [...row, i + 1])
  );

  // Each settings key is seeded independently so a new section added in a later release
  // still gets its defaults on an existing database.
  for (const [key, value] of Object.entries(SEED_SETTINGS)) {
    await query(
      `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, JSON.stringify(value)]
    );
  }
}

// `table` is only ever one of this file's own literals, never user input.
async function seedIfEmpty(client, table, rows, insert) {
  const { rows: counted } = await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
  if (counted[0].count > 0) return;
  for (const [i, row] of rows.entries()) await insert(row, i);
  console.log(`Seeded ${rows.length} ${table}`);
}

// --- settings helpers -------------------------------------------------------

export async function getSetting(key, fallback = null) {
  const { rows } = await query("SELECT value FROM settings WHERE key = $1", [key]);
  return rows[0] ? rows[0].value : fallback;
}

export async function setSetting(key, value) {
  await query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  );
  return value;
}

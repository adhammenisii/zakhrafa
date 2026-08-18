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

// Creates tables if they don't exist yet and seeds the product catalog on a fresh database.
// Safe to run on every boot.
export async function ensureSchema() {
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

  const { rows } = await query("SELECT COUNT(*)::int AS count FROM products");
  if (rows[0].count === 0) {
    for (const row of SEED_PRODUCTS) {
      await query(
        `INSERT INTO products (name, cat, price, img, images, stock, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        row
      );
    }
    console.log(`Seeded ${SEED_PRODUCTS.length} products`);
  }
}

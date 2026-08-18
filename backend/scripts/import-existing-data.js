// One-time script to carry real orders/messages from the old JSON files into Postgres.
// Run manually once, after DATABASE_URL is set: `node backend/scripts/import-existing-data.js`
// Products are NOT imported here — ensureSchema() already seeds the current catalog on first boot.
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool, ensureSchema } from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");

function readJson(name) {
  const file = path.join(dataDir, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

async function importOrders() {
  const orders = readJson("orders");
  for (const o of orders) {
    const subtotal = o.subtotal ?? o.total;
    await pool.query(
      `INSERT INTO orders (id, customer, items, subtotal, promo_code, discount, total, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO NOTHING`,
      [o.id, JSON.stringify(o.customer), JSON.stringify(o.items), subtotal, o.promoCode || null, o.discount || 0, o.total, o.status || "pending", o.createdAt]
    );
  }
  if (orders.length) {
    await pool.query(`SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders))`);
  }
  console.log(`Imported ${orders.length} orders`);
}

async function importMessages() {
  const messages = readJson("messages");
  for (const m of messages) {
    await pool.query(
      `INSERT INTO messages (id, name, email, subject, message, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO NOTHING`,
      [m.id, m.name, m.email, m.subject || "", m.message, m.createdAt]
    );
  }
  if (messages.length) {
    await pool.query(`SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages))`);
  }
  console.log(`Imported ${messages.length} messages`);
}

async function main() {
  await ensureSchema();
  await importOrders();
  await importMessages();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

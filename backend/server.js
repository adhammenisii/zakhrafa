import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { ensureSchema } from "./db.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import paymentRouter from "./routes/payment.js";
import adminRouter from "./routes/admin.js";
import contactRouter from "./routes/contact.js";
import promoRouter from "./routes/promo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// static admin panel (plain HTML/JS — see /public/admin.html)
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/contact", contactRouter);
app.use("/api/promo", promoRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// serve the built React app (production) — frontend/dist only exists after `npm run build`;
// in local dev the frontend runs on its own Vite server instead, so this is skipped if absent.
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

const PORT = process.env.PORT || 4000;
ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Zakhrafa backend running on http://localhost:${PORT}`);
      console.log(`🔑 Admin panel: http://localhost:${PORT}/admin.html`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
  });

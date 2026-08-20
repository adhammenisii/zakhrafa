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
import categoriesRouter from "./routes/categories.js";
import contentRouter from "./routes/content.js";
import mediaRouter from "./routes/media.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fail fast with a clear message rather than surfacing confusing errors on the first request.
const missingEnv = ["DATABASE_URL", "ADMIN_PASSWORD", "JWT_SECRET"].filter((k) => !process.env[k]);
if (missingEnv.length) {
  console.error(`❌ Missing required environment variable(s): ${missingEnv.join(", ")}`);
  console.error("   Set them in backend/.env locally, or in the Render dashboard when deployed (see DEPLOY.md).");
  process.exit(1);
}

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
app.use("/api/categories", categoriesRouter);
app.use("/api/content", contentRouter);
app.use("/api/media", mediaRouter);

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

// Any error forwarded by asyncHandler lands here, so failures always return JSON
// (never a hanging request or an HTML error page the frontend can't parse).
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Client-side faults (e.g. body-parser's 400 on malformed JSON) should report as such
  // rather than being masked as a server error.
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error("Unhandled error:", err);

  res.status(status).json({
    error: status === 400 ? "Invalid request body" : "Something went wrong on our end. Please try again.",
  });
});

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

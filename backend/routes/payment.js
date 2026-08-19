import express from "express";
import { query } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = express.Router();

const PAYMOB_BASE = "https://accept.paymob.com/api";

/**
 * تدفق الدفع بتاع Paymob بيتكون من 3 خطوات:
 * 1) استخراج auth token من الـ API key
 * 2) تسجيل الطلب (order) عندهم
 * 3) طلب "payment key" وبيه نبني رابط الـ iframe اللي العميل بيدفع فيه
 *
 * الراوت ده بيتفعل تلقائيًا بمجرد ما تحط قيم PAYMOB_* في ملف .env
 */

router.post("/initiate", asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const { rows } = await query("SELECT * FROM orders WHERE id = $1", [orderId]);
  const order = rows[0];
  if (!order) return res.status(404).json({ error: "Order not found" });

  const { PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID } = process.env;
  if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID || !PAYMOB_IFRAME_ID) {
    return res.status(503).json({
      error: "Payment gateway isn't configured yet. Add your Paymob credentials to .env first (see .env.example).",
    });
  }

  try {
    // 1) auth token
    const authRes = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
    });
    const authData = await authRes.json();
    const authToken = authData.token;

    // 2) register order with Paymob
    const orderRes = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: Math.round(order.total * 100),
        currency: "EGP",
        merchant_order_id: order.id,
        items: order.items.map((i) => ({
          name: i.name,
          amount_cents: Math.round(i.price * 100),
          quantity: i.qty,
        })),
      }),
    });
    const paymobOrder = await orderRes.json();

    // 3) payment key
    const keyRes = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: Math.round(order.total * 100),
        expiration: 3600,
        order_id: paymobOrder.id,
        billing_data: {
          first_name: order.customer.name.split(" ")[0] || "Customer",
          last_name: order.customer.name.split(" ").slice(1).join(" ") || "Zakhrafa",
          phone_number: order.customer.phone,
          email: order.customer.email || "customer@example.com",
          city: "Cairo",
          country: "EG",
          street: order.customer.address,
          building: "NA",
          floor: "NA",
          apartment: "NA",
        },
        currency: "EGP",
        integration_id: PAYMOB_INTEGRATION_ID,
      }),
    });
    const keyData = await keyRes.json();

    const iframeUrl = `${PAYMOB_BASE.replace("/api", "")}/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${keyData.token}`;
    res.json({ paymentUrl: iframeUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred connecting to the payment gateway" });
  }
}));

// Paymob بيبعت هنا نتيجة الدفع (webhook) — استخدمه عشان تحدّث حالة الطلب أوتوماتيك
router.post("/webhook", express.json(), (req, res) => {
  // TODO: تحقق من الـ HMAC signature (PAYMOB_HMAC_SECRET) قبل ما تثق في الداتا دي في بيئة حقيقية
  console.log("Paymob webhook received:", req.body);
  res.sendStatus(200);
});

export default router;

import React from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useStore, fmt, orderRef } from "../lib/store.jsx";
import { INK, MUTED, LINE } from "../components/ui.jsx";
import { useSeo } from "../lib/useSeo.js";

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { lastOrder } = useStore();

  useSeo({ title: "Order Confirmed", description: "Your Zakhrafa order has been received.", noindex: true });

  const order = lastOrder && String(lastOrder.id) === orderId ? lastOrder : null;

  if (!order) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "110px 20px 130px", textAlign: "center" }}>
        <h1 className="serif" style={{ fontSize: 28, fontWeight: 600, margin: "0 0 14px" }}>Order {orderRef(orderId)}</h1>
        <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.9, marginBottom: 30 }}>
          We don't have this order's details in your current session (maybe the page was refreshed).
          If you placed this order, it has still been received — feel free to{" "}
          <Link to="/contact" style={{ color: INK }}>get in touch</Link> if you'd like a copy of your receipt.
        </p>
        <Link to="/" className="btn-anim" style={{ display: "inline-block", background: INK, color: "#fff", padding: "13px 30px", borderRadius: 2, textDecoration: "none", fontSize: 13.5 }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "70px 20px 110px" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 60, height: 60, borderRadius: "50%", background: "#F0F8F0", color: "#3E8E3E", marginBottom: 20 }}>
          <CheckCircle2 size={30} />
        </div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: MUTED, fontWeight: 600, marginBottom: 10 }}>THANK YOU</div>
        <h1 className="serif" style={{ fontSize: 30, fontWeight: 600, margin: "0 0 12px" }}>Your order is in!</h1>
        <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.8 }}>
          We've received your order and will contact you shortly to confirm payment and delivery.
        </p>
        <div style={{ display: "inline-block", marginTop: 18, background: "#FAF6F2", border: `1px solid ${LINE}`, borderRadius: 999, padding: "8px 20px", fontSize: 13, letterSpacing: 0.5 }}>
          Order reference: <strong>{orderRef(order.id)}</strong>
        </div>
      </div>

      <div style={{ border: `1px solid ${LINE}`, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${LINE}`, fontWeight: 600, fontSize: 14 }}>Order Summary</div>
        {order.items.map((item) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${LINE}`, fontSize: 13.5 }}>
            <span style={{ color: INK }}>{item.name} <span style={{ color: MUTED }}>× {item.qty}</span></span>
            <span>{fmt(item.price * item.qty)}</span>
          </div>
        ))}
        <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
          {order.discount > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: MUTED }}>
                <span>Subtotal</span>
                <span>{fmt(order.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#2F6B2F" }}>
                <span>Discount {order.promoCode ? `(${order.promoCode})` : ""}</span>
                <span>−{fmt(order.discount)}</span>
              </div>
            </>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 15 }}>
            <span>Total</span>
            <span>{fmt(order.total)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, border: `1px solid ${LINE}`, borderRadius: 4, padding: "16px 20px", fontSize: 13.5, color: MUTED, lineHeight: 1.9 }}>
        <strong style={{ color: INK }}>Delivering to:</strong> {order.customer.name} — {order.customer.phone}
        {order.customer.email && <> · {order.customer.email}</>}
        <br />
        {order.customer.address}
        {(order.customer.city || order.customer.postalCode || order.customer.governorate) && (
          <>
            <br />
            {[order.customer.city, order.customer.governorate, order.customer.postalCode].filter(Boolean).join(", ")}
          </>
        )}
        {order.customer.notes && (
          <>
            <br />
            <span style={{ fontStyle: "italic" }}>Notes: {order.customer.notes}</span>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Link to="/" className="btn-anim" style={{ display: "inline-block", background: INK, color: "#fff", padding: "13px 34px", borderRadius: 2, textDecoration: "none", fontWeight: 500, fontSize: 13.5, letterSpacing: 1 }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

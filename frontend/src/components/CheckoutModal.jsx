import React from "react";
import { X, Loader2, Tag, Check } from "lucide-react";
import { useStore, fmt } from "../lib/store.jsx";
import { INK, MUTED, LINE, BLUSH_DEEP } from "./ui.jsx";

export default function CheckoutModal() {
  const {
    checkoutOpen, setCheckoutOpen, checkoutForm, setCheckoutForm,
    cartSubtotal, cartTotal, placing, submitOrder,
    promo, promoInput, setPromoInput, promoStatus, promoError, applyPromo, clearPromo,
  } = useStore();
  if (!checkoutOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 65, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={() => setCheckoutOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(38,34,32,0.4)" }} />
      <form onSubmit={submitOrder} style={{ position: "relative", background: "#fff", maxWidth: 400, width: "100%", padding: 26, borderRadius: 4, maxHeight: "90vh", overflowY: "auto" }}>
        <button type="button" onClick={() => setCheckoutOpen(false)} className="icon-btn" style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: INK, borderRadius: 999, padding: 6 }}><X size={18} /></button>
        <div className="serif" style={{ fontSize: 22, marginBottom: 16 }}>Delivery Details</div>
        <input className="zk" required placeholder="Full Name" value={checkoutForm.name} onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })} />
        <input className="zk" required placeholder="Phone Number" value={checkoutForm.phone} onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })} />
        <textarea className="zk" required placeholder="Full Address" rows={3} value={checkoutForm.address} onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })} />

        {promo ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F6FBF6", border: "1px solid #CFE8CF", borderRadius: 4, padding: "9px 12px", marginBottom: 12, fontSize: 12.5 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7, color: "#2F6B2F" }}>
              <Check size={14} /> {promo.code} applied — {promo.label}
            </span>
            <button type="button" onClick={clearPromo} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 12, textDecoration: "underline", fontFamily: "inherit" }}>
              Remove
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Tag size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: MUTED }} />
                <input
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  style={{ width: "100%", padding: "10px 12px 10px 32px", border: `1px solid ${LINE}`, borderRadius: 4, fontFamily: "inherit", fontSize: 13 }}
                />
              </div>
              <button
                type="button"
                onClick={applyPromo}
                disabled={promoStatus === "checking" || !promoInput.trim()}
                className="btn-anim"
                style={{ background: "none", border: `1px solid ${INK}`, color: INK, borderRadius: 4, padding: "0 16px", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}
              >
                {promoStatus === "checking" ? "..." : "Apply"}
              </button>
            </div>
            {promoStatus === "error" && <div style={{ color: BLUSH_DEEP, fontSize: 11.5, marginTop: 6 }}>{promoError}</div>}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 12, margin: "4px 0 16px" }}>
          {promo && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: MUTED, marginBottom: 6 }}>
                <span>Subtotal</span>
                <span>{fmt(cartSubtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#2F6B2F", marginBottom: 6 }}>
                <span>Discount</span>
                <span>−{fmt(promo.discount)}</span>
              </div>
            </>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
            <span>Total</span>
            <span>{fmt(cartTotal)}</span>
          </div>
        </div>

        <button type="submit" disabled={placing} className="btn-anim" style={{ width: "100%", background: INK, color: "#fff", border: "none", borderRadius: 2, padding: "13px", fontWeight: 500, cursor: placing ? "default" : "pointer", fontFamily: "inherit", fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, opacity: placing ? 0.85 : 1 }}>
          {placing && <Loader2 size={16} className="spin" />}
          {placing ? "Placing order..." : "Confirm Order & Pay"}
        </button>
      </form>
    </div>
  );
}

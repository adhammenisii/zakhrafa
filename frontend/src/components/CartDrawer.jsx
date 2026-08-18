import React from "react";
import { X, Plus, Minus } from "lucide-react";
import { useStore, fmt } from "../lib/store.jsx";
import { SkeletonImg, Motif, INK, ACCENT, MUTED, LINE, SURFACE } from "./ui.jsx";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cartItems, cartTotal, changeQty, setCheckoutOpen } = useStore();
  if (!cartOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div onClick={() => setCartOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(38,34,32,0.35)" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "min(360px, 92vw)", background: "#fff", boxShadow: "-8px 0 30px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", animation: "slideIn .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 14px", borderBottom: `1px solid ${LINE}` }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Your Cart</span>
          <button onClick={() => setCartOpen(false)} className="icon-btn" style={{ background: "none", border: "none", cursor: "pointer", color: INK, borderRadius: 999, padding: 6 }}><X size={19} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px" }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", color: MUTED, marginTop: 60, fontSize: 13.5 }}>Your cart is empty</div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${LINE}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 4, background: SURFACE, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {item.img ? <SkeletonImg src={item.img} alt={item.name} /> : <Motif type={item.icon} className="w-7 h-7" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{fmt(item.price)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => changeQty(item.id, -1)} className="icon-btn" style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${LINE}`, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={11} /></button>
                  <span style={{ fontSize: 12.5, width: 14, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, 1)} className="icon-btn" style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${LINE}`, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={11} /></button>
                </div>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div style={{ padding: 20, borderTop: `1px solid ${LINE}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontWeight: 600, fontSize: 14 }}>
              <span>Total</span>
              <span>{fmt(cartTotal)}</span>
            </div>
            <button
              className="btn-anim"
              style={{ width: "100%", background: INK, color: "#fff", border: "none", borderRadius: 2, padding: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, letterSpacing: 0.5 }}
              onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { X, Heart } from "lucide-react";
import { useStore, fmt } from "../lib/store.jsx";
import { SkeletonImg, Motif, INK, ACCENT, MUTED, LINE, SURFACE, BLUSH_DEEP } from "./ui.jsx";

export default function WishlistDrawer() {
  const { wishlistOpen, setWishlistOpen, wishlistItems, removeFromWishlist, addToCart } = useStore();
  if (!wishlistOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div onClick={() => setWishlistOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(38,34,32,0.35)" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "min(360px, 92vw)", background: "#fff", boxShadow: "-8px 0 30px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", animation: "slideIn .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 14px", borderBottom: `1px solid ${LINE}` }}>
          <span style={{ fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}><Heart size={16} /> Your Wishlist</span>
          <button onClick={() => setWishlistOpen(false)} className="icon-btn" style={{ background: "none", border: "none", cursor: "pointer", color: INK, borderRadius: 999, padding: 6 }}><X size={19} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px" }}>
          {wishlistItems.length === 0 ? (
            <div style={{ textAlign: "center", color: MUTED, marginTop: 60, fontSize: 13.5 }}>Your wishlist is empty</div>
          ) : (
            wishlistItems.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${LINE}` }}>
                <Link to={`/product/${item.id}`} onClick={() => setWishlistOpen(false)} style={{ width: 48, height: 48, borderRadius: 4, background: SURFACE, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {item.img ? <SkeletonImg src={item.img} alt={item.name} /> : <Motif type={item.icon} className="w-7 h-7" />}
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/product/${item.id}`} onClick={() => setWishlistOpen(false)} style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, color: INK, textDecoration: "none", display: "block" }}>{item.name}</Link>
                  <div style={{ fontSize: 12, color: MUTED }}>{fmt(item.price)}</div>
                  <button onClick={() => addToCart(item.id)} className="btn-anim" style={{ marginTop: 6, background: "none", color: BLUSH_DEEP, border: `1px solid ${BLUSH_DEEP}`, borderRadius: 999, padding: "4px 11px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                    Add to Cart
                  </button>
                </div>
                <button onClick={() => removeFromWishlist(item.id)} aria-label="Remove from wishlist" className="icon-btn" style={{ width: 24, height: 24, borderRadius: 999, border: `1px solid ${LINE}`, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

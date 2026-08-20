import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useStore, isAvailable, fmt } from "../lib/store.jsx";
import { SkeletonImg, Motif, MUTED, INK, BLUSH_DEEP, SURFACE, ACCENT, LINE } from "./ui.jsx";

export default function ProductCard({ product }) {
  const { addToCart, isWishlisted, toggleWishlist, categories } = useStore();
  const wished = isWishlisted(product.id);
  const outOfStock = !isAvailable(product);

  return (
    <div className="product-card" style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 4, overflow: "hidden" }}>
      <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div style={{ position: "relative", height: 220, overflow: "hidden", background: SURFACE, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {product.img ? (
            <SkeletonImg src={product.img} alt={product.name} />
          ) : (
            <Motif type={product.icon} className="w-16 h-16" />
          )}
          {outOfStock && (
            <span style={{ position: "absolute", top: 10, left: 10, background: INK, color: "#fff", fontSize: 10, letterSpacing: 0.5, fontWeight: 600, padding: "5px 10px", borderRadius: 999 }}>
              Out of Stock
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="icon-btn"
            style={{
              position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: 999,
              background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: wished ? BLUSH_DEEP : INK,
            }}
          >
            <Heart size={15} fill={wished ? "currentColor" : "none"} />
          </button>
        </div>
        <div style={{ padding: "18px 18px 12px" }}>
          <div style={{ fontSize: 10.5, color: MUTED, letterSpacing: 0.5, marginBottom: 6 }}>
            {categories.find((c) => c.id === product.cat)?.label}
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 10, color: INK }}>{product.name}</div>
        </div>
      </Link>
      <div style={{ padding: "0 18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, color: INK, fontSize: 14 }}>{fmt(product.price)}</span>
        <button
          onClick={() => addToCart(product.id)}
          disabled={outOfStock}
          className="btn-anim"
          style={{
            background: "none", color: outOfStock ? MUTED : BLUSH_DEEP, border: `1px solid ${outOfStock ? LINE : BLUSH_DEEP}`,
            borderRadius: 999, padding: "6px 13px", fontSize: 11.5, cursor: outOfStock ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

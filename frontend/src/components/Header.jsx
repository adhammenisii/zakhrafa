import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";
import { useStore } from "../lib/store.jsx";
import { ZakhrafaMark, INK, LINE, BLUSH_DEEP } from "./ui.jsx";

export default function Header() {
  const { cartCount, setCartOpen, wishlist, setWishlistOpen } = useStore();

  return (
    <>
      <div style={{ background: INK, color: "#F3E9DF", textAlign: "center", fontSize: 11.5, letterSpacing: 1.5, padding: "8px 12px" }}>
        Welcome to Zakhrafa ✦ Fully handmade wooden pieces, crafted in Egypt
      </div>

      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(6px)", borderBottom: `1px solid ${LINE}` }}>
        <div className="header-row" style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, order: 3 }}>
            <button
              onClick={() => setWishlistOpen(true)}
              className="btn-anim"
              aria-label="Wishlist"
              style={{ position: "relative", background: "none", border: `1px solid ${INK}`, color: INK, borderRadius: 999, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Heart size={15} />
              {wishlist.length > 0 && (
                <span style={{ position: "absolute", top: -5, right: -5, background: BLUSH_DEEP, color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="btn-anim"
              style={{ position: "relative", background: "none", border: `1px solid ${INK}`, color: INK, borderRadius: 999, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}
            >
              <ShoppingBag size={15} />
              Cart
              {cartCount > 0 && (
                <span style={{ background: BLUSH_DEEP, color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: INK, order: 2 }}>
            <ZakhrafaMark size={44} />
            <span className="serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: 0.5 }}>Zakhrafa</span>
          </Link>

          <nav className="site-nav" style={{ fontSize: 13.5, color: INK, order: 1 }}>
            <Link to="/" className="nav-link" style={{ textDecoration: "none", color: "inherit" }}>Home</Link>
            <a href="/#shop" className="nav-link" style={{ textDecoration: "none", color: "inherit" }}>Shop</a>
            <Link to="/about" className="nav-link" style={{ textDecoration: "none", color: "inherit" }}>About</Link>
            <Link to="/faq" className="nav-link" style={{ textDecoration: "none", color: "inherit" }}>FAQ</Link>
            <Link to="/contact" className="nav-link" style={{ textDecoration: "none", color: "inherit" }}>Contact</Link>
          </nav>
        </div>
      </header>
    </>
  );
}

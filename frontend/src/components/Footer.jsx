import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle, ArrowRight } from "lucide-react";
import { useStore } from "../lib/store.jsx";
import { Reveal, INK, MUTED, LINE } from "./ui.jsx";

export default function Footer() {
  const { setToast } = useStore();

  return (
    <footer style={{ borderTop: `1px solid ${LINE}`, marginTop: 90 }}>
      <Reveal style={{ maxWidth: 1120, margin: "0 auto", padding: "50px 20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 30 }}>
        <div style={{ maxWidth: 360 }}>
          <div className="serif" style={{ fontSize: 20, marginBottom: 10 }}>Subscribe to our Newsletter</div>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, lineHeight: 1.8 }}>Be the first to know about new pieces and special offers.</p>
          <form onSubmit={(e) => { e.preventDefault(); setToast("Subscribed successfully!"); e.target.reset(); }} style={{ display: "flex", borderBottom: `1px solid ${INK}`, maxWidth: 320 }}>
            <input required type="email" placeholder="Your email" style={{ flex: 1, border: "none", padding: "8px 4px", fontFamily: "inherit", fontSize: 13.5, outline: "none" }} />
            <button type="submit" className="icon-btn" style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 4px", color: INK, borderRadius: 4 }}><ArrowRight size={16} /></button>
          </form>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: MUTED }}>
          <span style={{ color: INK, fontWeight: 600, marginBottom: 4 }}>Quick Links</span>
          <a href="/#shop" style={{ color: "inherit", textDecoration: "none" }}>Shop</a>
          <Link to="/about" style={{ color: "inherit", textDecoration: "none" }}>About</Link>
          <Link to="/faq" style={{ color: "inherit", textDecoration: "none" }}>FAQ</Link>
          <Link to="/contact" style={{ color: "inherit", textDecoration: "none" }}>Contact</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ color: INK, fontWeight: 600, fontSize: 13 }}>Follow Us</span>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="https://instagram.com/zakhrafa_handmade" target="_blank" rel="noreferrer" aria-label="Instagram" className="icon-btn" style={{ color: INK, border: `1px solid ${LINE}`, borderRadius: 999, padding: 9, display: "flex" }}><Instagram size={16} /></a>
            <a href="https://facebook.com/zakhrafahandmade" target="_blank" rel="noreferrer" aria-label="Facebook" className="icon-btn" style={{ color: INK, border: `1px solid ${LINE}`, borderRadius: 999, padding: 9, display: "flex" }}><Facebook size={16} /></a>
            <a href="https://wa.me/201000000000" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="icon-btn" style={{ color: INK, border: `1px solid ${LINE}`, borderRadius: 999, padding: 9, display: "flex" }}><MessageCircle size={16} /></a>
          </div>
        </div>
      </Reveal>
      <div style={{ borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "18px 20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div className="serif" style={{ fontSize: 15, color: INK }}>Zakhrafa</div>
          <div style={{ fontSize: 11.5, color: MUTED }}>© 2026 Zakhrafa Handmade — Made with love in Egypt</div>
        </div>
      </div>
    </footer>
  );
}

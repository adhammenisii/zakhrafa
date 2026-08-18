import React from "react";
import { Link } from "react-router-dom";
import { ZakhrafaMark, INK, MUTED } from "../components/ui.jsx";
import { useSeo } from "../lib/useSeo.js";

export default function NotFoundPage() {
  useSeo({
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or may have moved.",
    noindex: true,
  });

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "110px 20px 130px", textAlign: "center" }}>
      <div style={{ opacity: 0.5, marginBottom: 24 }}>
        <ZakhrafaMark size={64} />
      </div>
      <div style={{ fontSize: 13, letterSpacing: 3, color: MUTED, fontWeight: 600, marginBottom: 14 }}>ERROR 404</div>
      <h1 className="serif" style={{ fontSize: 32, fontWeight: 600, margin: "0 0 14px" }}>Page Not Found</h1>
      <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.9, marginBottom: 34 }}>
        The page you're looking for doesn't exist, may have been moved, or the link is out of date.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/" className="btn-anim" style={{ background: INK, color: "#fff", padding: "13px 30px", borderRadius: 2, textDecoration: "none", fontSize: 13.5, letterSpacing: 0.5 }}>
          Back to Home
        </Link>
        <Link to="/#shop" className="btn-anim" style={{ background: "none", color: INK, border: "1px solid #ECE7E1", padding: "13px 30px", borderRadius: 2, textDecoration: "none", fontSize: 13.5 }}>
          Shop All Products
        </Link>
      </div>
    </div>
  );
}

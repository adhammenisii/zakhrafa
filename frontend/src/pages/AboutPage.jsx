import React from "react";
import { Link } from "react-router-dom";
import { Reveal, SkeletonImg, INK, MUTED } from "../components/ui.jsx";
import TrustBadges from "../components/TrustBadges.jsx";
import { useSeo } from "../lib/useSeo.js";

export default function AboutPage() {
  useSeo({
    title: "About Us",
    description: "Learn the story behind Zakhrafa — an Egyptian brand crafting fully handmade wooden art, from mosaic mirrors to Pharaonic-inspired panels.",
  });

  return (
    <div>
      <section style={{ position: "relative", height: 320, overflow: "hidden" }}>
        <SkeletonImg src="/images/products/panel.jpg" alt="Handcrafted wooden panel" objectPosition="center 30%" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,12,10,0.25) 0%, rgba(20,12,10,0.55) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 3.5, color: "#F3E9DF", fontWeight: 600, marginBottom: 14 }}>OUR STORY</div>
          <h1 className="serif" style={{ fontSize: "clamp(26px, 5vw, 44px)", fontWeight: 600, margin: 0, color: "#fff", maxWidth: 900 }}>About Zakhrafa</h1>
        </div>
      </section>

      <TrustBadges />

      <section style={{ maxWidth: 720, margin: "70px auto 0", padding: "0 20px", textAlign: "center" }}>
        <Reveal>
          <p style={{ color: MUTED, lineHeight: 2, fontSize: 15.5 }}>
            Zakhrafa started with a simple passion for wood and color. What began as one
            person's love for hand-painting and carving grew, piece by piece, into a small
            workshop dedicated to turning raw wood into art. Today every panel, mirror, and
            decor piece we make is still shaped entirely by hand — no printing, no molds,
            no mass production — so no two pieces are ever quite the same.
          </p>
        </Reveal>
      </section>

      <section style={{ maxWidth: 1120, margin: "60px auto 0", padding: "0 20px 90px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          <Reveal delay={0}>
            <div style={{ background: INK, color: "#E7B9C4", aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
              <span className="serif" style={{ fontSize: 24, fontStyle: "italic" }}>What is Zakhrafa?</span>
            </div>
            <p style={{ color: MUTED, lineHeight: 2, fontSize: 14, marginTop: 18 }}>
              Zakhrafa is an Egyptian brand dedicated to fully handmade wooden pieces — painted panels, mosaic mirrors, and occasion decor. Every piece is hand-painted and finished by a craftsperson, so no two pieces are ever quite the same.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ background: INK, color: "#E7B9C4", aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
              <span className="serif" style={{ fontSize: 24, fontStyle: "italic" }}>Who's Behind Zakhrafa?</span>
            </div>
            <p style={{ color: MUTED, lineHeight: 2, fontSize: 14, marginTop: 18 }}>
              A passion for wood and color that grew into a small workshop turning raw material into art. Every design is shaped by brush and chisel — no printing, no mass production.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div style={{ background: INK, color: "#E7B9C4", aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
              <span className="serif" style={{ fontSize: 24, fontStyle: "italic" }}>Why Zakhrafa?</span>
            </div>
            <p style={{ color: MUTED, lineHeight: 2, fontSize: 14, marginTop: 18 }}>
              Our inspiration comes from Egypt's layered artistic heritage — Pharaonic and Oriental alike — translated into modern decor for your home, or a gift with a truly authentic identity.
            </p>
          </Reveal>
        </div>
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <Link to="/#shop" className="btn-anim" style={{ display: "inline-block", background: INK, color: "#fff", padding: "13px 34px", borderRadius: 2, textDecoration: "none", fontWeight: 500, fontSize: 13.5, letterSpacing: 1 }}>
            Shop All Products
          </Link>
        </div>
      </section>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store.jsx";
import { Reveal, SkeletonImg, INK, MUTED } from "../components/ui.jsx";
import TrustBadges from "../components/TrustBadges.jsx";
import { useSeo } from "../lib/useSeo.js";

// Dark scrim over the photo so the existing overlaid text keeps its contrast.
const CARD_SCRIM = "linear-gradient(rgba(28,20,17,0.62), rgba(28,20,17,0.62))";

const cardImageStyle = {
  background: INK,
  color: "#E7B9C4",
  aspectRatio: "1 / 1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: 20,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export default function AboutPage() {
  const { content } = useStore();
  const about = content.about;

  useSeo({
    title: "About Us",
    description: "Learn the story behind Zakhrafa — an Egyptian brand crafting fully handmade wooden art, from mosaic mirrors to Pharaonic-inspired panels.",
  });

  return (
    <div>
      <section style={{ position: "relative", height: 320, overflow: "hidden" }}>
        <SkeletonImg src={about.heroImage} alt="Handcrafted wooden panel" objectPosition="center 30%" eager />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,12,10,0.25) 0%, rgba(20,12,10,0.55) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 3.5, color: "#F3E9DF", fontWeight: 600, marginBottom: 14 }}>OUR STORY</div>
          <h1 className="serif" style={{ fontSize: "clamp(26px, 5vw, 44px)", fontWeight: 600, margin: 0, color: "#fff", maxWidth: 900 }}>About Zakhrafa</h1>
        </div>
      </section>

      <TrustBadges />

      <section style={{ maxWidth: 720, margin: "70px auto 0", padding: "0 20px", textAlign: "center" }}>
        <Reveal>
          <p style={{ color: MUTED, lineHeight: 2, fontSize: 15.5 }}>{about.intro}</p>
        </Reveal>
      </section>

      <section style={{ maxWidth: 1120, margin: "60px auto 0", padding: "0 20px 90px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {(about.cards || []).map((card, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{ ...cardImageStyle, backgroundImage: card.image ? `${CARD_SCRIM}, url('${card.image}')` : undefined }}>
                <span className="serif" style={{ fontSize: 24, fontStyle: "italic" }}>{card.title}</span>
              </div>
              <p style={{ color: MUTED, lineHeight: 2, fontSize: 14, marginTop: 18 }}>{card.body}</p>
            </Reveal>
          ))}
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

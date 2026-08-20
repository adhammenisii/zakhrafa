import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useStore } from "../lib/store.jsx";
import { Reveal, SkeletonImg, INK, MUTED, LINE } from "../components/ui.jsx";
import ProductCard from "../components/ProductCard.jsx";
import TrustBadges from "../components/TrustBadges.jsx";
import { useSeo } from "../lib/useSeo.js";

export default function HomePage() {
  const { products, categories, content, loading } = useStore();
  const [searchParams] = useSearchParams();
  const [activeCat, setActiveCat] = useState("all");
  const hero = content.hero;

  useSeo({
    description: hero.subtitle || "Fully handmade wooden art from Egypt — painted panels, mosaic mirrors, and occasion decor inspired by Pharaonic and Oriental heritage.",
  });

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) {
      setActiveCat(cat);
      setTimeout(() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [searchParams]);

  const filtered = useMemo(() => (activeCat === "all" ? products : products.filter((p) => p.cat === activeCat)), [activeCat, products]);
  const featured = useMemo(() => products.filter((p) => p.featured), [products]);

  const goShopCat = (catId) => {
    setActiveCat(catId);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* HERO */}
      <section id="top" style={{ position: "relative", height: "min(88vh, 680px)", overflow: "hidden" }}>
        <SkeletonImg
          src={hero.image}
          alt="Zakhrafa — fully handmade wooden art"
          objectPosition="center 30%"
          eager
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,12,10,0.15) 0%, rgba(20,12,10,0.45) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px 24px" }}>
          {hero.eyebrow && <div style={{ fontSize: 11.5, letterSpacing: 3.5, color: "#F3E9DF", fontWeight: 600, marginBottom: 18 }}>{hero.eyebrow}</div>}
          <h1 className="serif" style={{ fontSize: "clamp(30px, 6.5vw, 64px)", fontWeight: 600, letterSpacing: 0.3, margin: 0, color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.25)", maxWidth: 900 }}>
            {hero.title}
          </h1>
          {hero.subtitle && (
            <p style={{ fontSize: 15.5, color: "#F3E9DF", marginTop: 18, lineHeight: 1.9, maxWidth: 480, marginInline: "auto" }}>
              {hero.subtitle}
            </p>
          )}
          <a href="#shop" className="btn-anim" style={{ display: "inline-block", marginTop: 30, background: "#fff", color: INK, padding: "13px 34px", borderRadius: 2, textDecoration: "none", fontWeight: 500, fontSize: 13.5, letterSpacing: 1 }}>
            {hero.ctaLabel}
          </a>
        </div>
      </section>

      <TrustBadges />

      {/* CATEGORY TILES */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "54px 20px 10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <button
                onClick={() => goShopCat(c.id)}
                style={{ position: "relative", width: "100%", height: 190, border: "none", padding: 0, cursor: "pointer", borderRadius: 4, overflow: "hidden" }}
                className="banner"
              >
                <SkeletonImg src={c.img} alt={c.label} imgClassName="banner-img" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,12,10,0) 40%, rgba(20,12,10,0.55) 100%)" }} />
                <span className="serif" style={{ position: "absolute", bottom: 14, right: 0, left: 0, textAlign: "center", color: "#fff", fontSize: 17, fontWeight: 600 }}>
                  {c.label}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED — only shown once pieces are ticked as featured in the admin panel */}
      {featured.length > 0 && (
        <section style={{ maxWidth: 1120, margin: "0 auto", padding: "54px 20px 0" }}>
          <Reveal>
            <div style={{ fontSize: 11, letterSpacing: 3, color: MUTED, fontWeight: 600, textAlign: "center", marginBottom: 10 }}>HAND-PICKED</div>
            <h2 className="serif" style={{ fontSize: 32, textAlign: "center", fontWeight: 600, marginBottom: 36 }}>Featured Pieces</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 22 }}>
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <div style={{ height: 1, background: LINE, maxWidth: 1120, margin: "60px auto 0" }} />

      {/* SHOP */}
      <section id="shop" style={{ maxWidth: 1120, margin: "0 auto", padding: "60px 20px 20px" }}>
        <Reveal>
          <div style={{ fontSize: 11, letterSpacing: 3, color: MUTED, fontWeight: 600, textAlign: "center", marginBottom: 10 }}>OUR WORK</div>
          <h2 className="serif" style={{ fontSize: 32, textAlign: "center", fontWeight: 600, marginBottom: 36 }}>Our Work</h2>
        </Reveal>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 44 }}>
          <button onClick={() => setActiveCat("all")} className="cat-pill" style={{ padding: "8px 16px", borderRadius: 999, border: `1px solid ${activeCat === "all" ? INK : LINE}`, background: activeCat === "all" ? INK : "transparent", color: activeCat === "all" ? "#fff" : MUTED, fontFamily: "inherit", fontSize: 12.5, cursor: "pointer" }}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveCat(c.id)} className="cat-pill" style={{ padding: "8px 16px", borderRadius: 999, border: `1px solid ${activeCat === c.id ? INK : LINE}`, background: activeCat === c.id ? INK : "transparent", color: activeCat === c.id ? "#fff" : MUTED, fontFamily: "inherit", fontSize: 12.5, cursor: "pointer" }}>
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: MUTED, padding: 60 }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", color: MUTED, padding: 60 }}>
            No products yet. Make sure the backend server is running on localhost:4000.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 22 }}>
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* COLLECTION BANNERS */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 20px 0" }}>
        <Reveal>
          <div className="collection-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: `1px solid ${LINE}` }}>
            <div className="banner collection-photo" style={{ position: "relative", height: 420, overflow: "hidden" }}>
              <SkeletonImg src="/images/products/panel.jpg" alt="Engraved panels" imgClassName="banner-img" />
            </div>
            <div className="collection-text" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "40px 48px" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: MUTED, fontWeight: 600, marginBottom: 10 }}>ARABESQUE COLLECTION</div>
              <h3 className="serif" style={{ fontSize: 30, fontWeight: 600, margin: "0 0 18px" }}>Engraved Panels</h3>
              <button onClick={() => goShopCat("oriental")} className="btn-anim" style={{ background: "none", border: "none", color: INK, cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, padding: 0, borderBottom: `1px solid ${INK}`, paddingBottom: 3 }}>
                Shop the Collection <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="collection-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: `1px solid ${LINE}`, borderTop: "none" }}>
            <div className="collection-text" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "40px 48px", order: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: MUTED, fontWeight: 600, marginBottom: 10 }}>RAMADAN & OCCASIONS</div>
              <h3 className="serif" style={{ fontSize: 30, fontWeight: 600, margin: "0 0 18px" }}>Occasion Decor</h3>
              <button onClick={() => goShopCat("ramadan")} className="btn-anim" style={{ background: "none", border: "none", color: INK, cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, padding: 0, borderBottom: `1px solid ${INK}`, paddingBottom: 3 }}>
                Shop the Collection <ArrowRight size={14} />
              </button>
            </div>
            <div className="banner collection-photo" style={{ position: "relative", height: 420, overflow: "hidden", order: 2 }}>
              <SkeletonImg src="/images/products/ramadan.jpg" alt="Ramadan decor" imgClassName="banner-img" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* OUR STORY (short teaser — full story lives on the About page) */}
      <section style={{ maxWidth: 720, margin: "90px auto 0", padding: "0 20px 30px", textAlign: "center" }}>
        <Reveal>
          <div style={{ fontSize: 11, letterSpacing: 3, color: MUTED, fontWeight: 600, marginBottom: 10 }}>OUR STORY</div>
          <h2 className="serif" style={{ fontSize: 30, fontWeight: 600, marginBottom: 20, letterSpacing: 0.5 }}>{content.about.storyTitle}</h2>
          <p style={{ color: MUTED, lineHeight: 2, fontSize: 15 }}>{content.about.storyText}</p>
          <Link to="/about" className="btn-anim" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 22, color: INK, textDecoration: "none", fontSize: 13.5, borderBottom: `1px solid ${INK}`, paddingBottom: 3 }}>
            Read Our Full Story <ArrowRight size={14} />
          </Link>
        </Reveal>
      </section>
    </>
  );
}

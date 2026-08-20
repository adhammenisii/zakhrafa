import React, { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useStore, isAvailable, fmt } from "../lib/store.jsx";
import { Reveal, Breadcrumbs, INK, MUTED, LINE, BLUSH_DEEP } from "../components/ui.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductGallery from "../components/ProductGallery.jsx";
import TrustBadges from "../components/TrustBadges.jsx";
import { useSeo } from "../lib/useSeo.js";

export default function ProductPage() {
  const { id } = useParams();
  const productId = Number(id);
  const { products, categories, loading, addToCart, isWishlisted, toggleWishlist, recentlyViewed, addRecentlyViewed } = useStore();

  const product = products.find((p) => p.id === productId);

  useSeo({
    title: product ? product.name : !loading ? "Product Not Found" : undefined,
    description: product?.description || "A fully handmade wooden piece from Zakhrafa, finished with natural colors and fine detail.",
    image: product?.img ? `${window.location.origin}${product.img}` : undefined,
    noindex: !loading && !product,
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [productId]);

  useEffect(() => {
    if (product) addRecentlyViewed(product.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, 4);
  }, [products, product]);

  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewed
      .filter((rid) => rid !== productId)
      .map((rid) => products.find((p) => p.id === rid))
      .filter(Boolean)
      .slice(0, 4);
  }, [recentlyViewed, products, productId]);

  if (loading) {
    return <div style={{ maxWidth: 1120, margin: "0 auto", padding: "100px 20px", textAlign: "center", color: MUTED }}>Loading...</div>;
  }

  if (!product) {
    return (
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "100px 20px", textAlign: "center" }}>
        <h2 className="serif" style={{ fontSize: 26, marginBottom: 12 }}>Product not found</h2>
        <p style={{ color: MUTED, marginBottom: 24 }}>This piece may have sold out or the link is out of date.</p>
        <Link to="/" className="btn-anim" style={{ display: "inline-block", background: INK, color: "#fff", padding: "12px 28px", borderRadius: 2, textDecoration: "none", fontSize: 13.5 }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const categoryLabel = categories.find((c) => c.id === product.cat)?.label || product.cat;
  const wished = isWishlisted(product.id);
  const outOfStock = !isAvailable(product);
  const galleryImages = product.images?.length ? product.images : product.img ? [product.img] : [];

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px 20px" }}>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: categoryLabel, to: `/?cat=${product.cat}` },
          { label: product.name },
        ]}
      />

      <div className="product-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 30 }}>
        <div style={{ position: "relative" }}>
          <ProductGallery images={galleryImages} name={product.name} icon={product.icon} />
          {outOfStock && (
            <span style={{ position: "absolute", top: 14, left: 14, background: INK, color: "#fff", fontSize: 11, letterSpacing: 0.5, fontWeight: 600, padding: "6px 12px", borderRadius: 999 }}>
              Out of Stock
            </span>
          )}
          <button
            onClick={() => toggleWishlist(product.id)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="icon-btn"
            style={{
              position: "absolute", top: 14, right: 14, width: 38, height: 38, borderRadius: 999,
              background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: wished ? BLUSH_DEEP : INK,
            }}
          >
            <Heart size={18} fill={wished ? "currentColor" : "none"} />
          </button>
        </div>

        <div>
          <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>{categoryLabel}</div>
          <h1 className="serif" style={{ fontSize: 34, fontWeight: 600, margin: "0 0 14px" }}>{product.name}</h1>
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 22 }}>{fmt(product.price)}</div>
          <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.9, marginBottom: 28, maxWidth: 460 }}>
            {product.description || "A fully handmade wooden piece, finished with natural colors and fine detail."}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => addToCart(product.id)}
              disabled={outOfStock}
              className="btn-anim"
              style={{
                background: outOfStock ? "#EFE9E3" : INK, color: outOfStock ? MUTED : "#fff", border: "none", borderRadius: 2,
                padding: "13px 30px", fontWeight: 500, cursor: outOfStock ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13.5, letterSpacing: 0.5,
              }}
            >
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className="btn-anim"
              style={{ display: "flex", alignItems: "center", gap: 8, background: "none", color: wished ? BLUSH_DEEP : INK, border: `1px solid ${wished ? BLUSH_DEEP : LINE}`, borderRadius: 2, padding: "13px 22px", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5 }}
            >
              <Heart size={15} fill={wished ? "currentColor" : "none"} />
              {wished ? "In Wishlist" : "Add to Wishlist"}
            </button>
          </div>
          <TrustBadges compact />
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ marginTop: 70 }}>
          <Reveal>
            <h2 className="serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>You Might Also Like</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {recentlyViewedProducts.length > 0 && (
        <section style={{ marginTop: 70, paddingBottom: 20 }}>
          <Reveal>
            <h2 className="serif" style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Recently Viewed</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {recentlyViewedProducts.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

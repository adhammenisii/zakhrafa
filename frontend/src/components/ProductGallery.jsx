import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { SkeletonImg, Motif, ACCENT, SURFACE, LINE, INK } from "./ui.jsx";

export default function ProductGallery({ images, name, icon }) {
  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const imageKey = (images || []).join("|");

  // This component isn't remounted when navigating between products, so a stale index from a
  // multi-photo product would point past the end of a single-photo one (blank image).
  useEffect(() => {
    setActive(0);
    setLightboxOpen(false);
  }, [imageKey]);

  // Let Escape close the lightbox, and lock background scroll while it's open.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setActive((a) => (a + 1) % images.length);
      if (e.key === "ArrowLeft") setActive((a) => (a - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, images]);

  if (!images || images.length === 0) {
    return (
      <div style={{ height: 460, background: SURFACE, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}>
        <Motif type={icon} className="w-24 h-24" />
      </div>
    );
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const step = (delta) => setActive((a) => (a + delta + images.length) % images.length);

  return (
    <div>
      <div
        style={{ position: "relative", height: 460, background: SURFACE, borderRadius: 4, overflow: "hidden", cursor: "zoom-in" }}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setLightboxOpen(true)}
      >
        <SkeletonImg src={images[active]} alt={name} />
        {zooming && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: `url(${images[active]})`,
              backgroundSize: "220%",
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
        <div style={{ position: "absolute", bottom: 12, insetInlineStart: 12, background: "rgba(20,12,10,0.6)", color: "#fff", borderRadius: 999, padding: "5px 11px", fontSize: 11, display: "flex", alignItems: "center", gap: 6, pointerEvents: "none" }}>
          <ZoomIn size={12} /> Click to zoom
        </div>
      </div>

      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              style={{
                width: 64, height: 64, padding: 0, borderRadius: 4, overflow: "hidden", cursor: "pointer",
                border: i === active ? `2px solid ${INK}` : `1px solid ${LINE}`,
              }}
            >
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(18,12,10,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <button onClick={() => setLightboxOpen(false)} aria-label="Close" className="icon-btn" style={{ position: "absolute", top: 20, insetInlineEnd: 20, background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", borderRadius: 999, width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={20} />
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              aria-label="Previous photo"
              className="icon-btn"
              style={{ position: "absolute", insetInlineStart: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", borderRadius: 999, width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <img
            src={images[active]}
            alt={name}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 2 }}
          />

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); step(1); }}
              aria-label="Next photo"
              className="icon-btn"
              style={{ position: "absolute", insetInlineEnd: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", borderRadius: 999, width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

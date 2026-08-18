import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export const INK = "#2B2420";
export const ACCENT = "#B8875A";
export const BLUSH = "#E7B9C4";
export const BLUSH_DEEP = "#C98BA0";
export const MUTED = "#8A8079";
export const LINE = "#ECE7E1";
export const SURFACE = "#FAF6F2";

export function Motif({ type, className }) {
  const common = { className, viewBox: "0 0 100 100", xmlns: "http://www.w3.org/2000/svg" };
  if (type === "rosette") {
    return (
      <svg {...common}>
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="17" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1="50" y1="50" x2={50 + 30 * Math.cos((i * Math.PI) / 4)} y2={50 + 30 * Math.sin((i * Math.PI) / 4)} opacity="0.35" />
          ))}
        </g>
      </svg>
    );
  }
  if (type === "ankh") {
    return (
      <svg {...common}>
        <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <ellipse cx="50" cy="30" rx="12" ry="16" />
          <line x1="50" y1="46" x2="50" y2="82" />
          <line x1="32" y1="58" x2="68" y2="58" />
        </g>
      </svg>
    );
  }
  if (type === "crescent") {
    return (
      <svg {...common}>
        <path d="M60 22 A26 26 0 1 0 60 78 A20 20 0 1 1 60 22 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M27 55 Q27 74 50 74 Q73 74 73 55 L70 46 L30 46 Z" />
        <path d="M30 46 Q22 41 17 32" />
        <ellipse cx="50" cy="45" rx="22" ry="5.5" />
      </g>
    </svg>
  );
}

// Leaf sprig repeated along an arc — used to build the laurel wreath in the logo mark.
function LaurelArc({ side }) {
  const leaves = Array.from({ length: 7 });
  const sign = side === "left" ? -1 : 1;
  return (
    <g>
      {leaves.map((_, i) => {
        const t = i / (leaves.length - 1); // 0..1 along the arc
        const angle = (Math.PI * 0.18) + t * Math.PI * 0.62; // sweep along bottom half
        const r = 74;
        const cx = 100 + sign * r * Math.sin(angle);
        const cy = 100 + r * Math.cos(angle);
        const rot = sign * (angle * (180 / Math.PI)) * -1 + (side === "left" ? -20 : 20);
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx="9"
            ry="4.2"
            transform={`rotate(${rot} ${cx} ${cy})`}
            fill="none"
            stroke="#7A5A34"
            strokeWidth="1.1"
          />
        );
      })}
    </g>
  );
}

export function ZakhrafaMark({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="98" fill={BLUSH} />
      <circle cx="100" cy="100" r="98" fill="none" stroke="#7A5A34" strokeWidth="0.75" opacity="0.5" />
      <LaurelArc side="left" />
      <LaurelArc side="right" />
      {/* crown */}
      <g transform="translate(100,46)" fill="none" stroke="#7A5A34" strokeWidth="2" strokeLinejoin="round">
        <path d="M-16 8 L-16 -4 L-8 4 L0 -10 L8 4 L16 -4 L16 8 Z" />
        <line x1="-16" y1="8" x2="16" y2="8" />
      </g>
      <text x="100" y="112" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="26" letterSpacing="2" fill="#5C4326">
        ZAKHRAFA
      </text>
      <text x="100" y="130" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontStyle="italic" fontSize="11" letterSpacing="1" fill="#5C4326">
        where wood meet art
      </text>
      {/* crossed mallet + chisel */}
      <g transform="translate(100,152)" stroke="#7A5A34" strokeWidth="2" strokeLinecap="round">
        <line x1="-14" y1="-8" x2="10" y2="10" />
        <rect x="-19" y="-14" width="10" height="8" rx="1.5" transform="rotate(45 -14 -10)" fill="#7A5A34" stroke="none" />
        <line x1="14" y1="-8" x2="-10" y2="10" />
        <path d="M11 -12 L18 -5" />
      </g>
    </svg>
  );
}

// Fills its parent box, showing an animated shimmer placeholder until the photo has actually loaded.
export function SkeletonImg({ src, alt, objectPosition = "center", imgClassName = "" }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {!loaded && <div className="skeleton-shimmer" style={{ position: "absolute", inset: 0 }} />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={imgClassName}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition, opacity: loaded ? 1 : 0, transition: "opacity .4s ease" }}
      />
    </div>
  );
}

// Fades + slides its children in the first time they scroll into view.
export function Reveal({ children, delay = 0, style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal${visible ? " reveal-visible" : ""}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

// items: [{ label, to? }] — the last item (no `to`) renders as the current page, not a link.
export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, fontSize: 12.5, color: MUTED, marginBottom: 28 }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <ChevronRight size={12} style={{ opacity: 0.5, flexShrink: 0 }} />}
          {item.to ? (
            <Link to={item.to} className="crumb-link" style={{ color: MUTED, textDecoration: "none" }}>
              {item.label}
            </Link>
          ) : (
            <span style={{ color: INK }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

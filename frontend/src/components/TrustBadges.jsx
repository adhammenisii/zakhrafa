import React from "react";
import { Hammer, ShieldCheck, Truck } from "lucide-react";
import { INK, MUTED, LINE } from "./ui.jsx";

const BADGES = [
  { icon: Hammer, label: "Handmade in Egypt", sub: "Crafted by hand, piece by piece" },
  { icon: ShieldCheck, label: "100% Authentic", sub: "Genuine, original designs" },
  { icon: Truck, label: "Free Shipping", sub: "Across Egypt · Delivered in 2–4 business days" },
];

export default function TrustBadges({ compact = false }) {
  if (compact) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 20 }}>
        {BADGES.map(({ icon: Icon, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: MUTED }}>
            <Icon size={15} style={{ color: INK, flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
        {BADGES.map(({ icon: Icon, label, sub }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", textAlign: "left" }}>
            <Icon size={26} style={{ color: INK, flexShrink: 0 }} strokeWidth={1.5} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: INK }}>{label}</div>
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

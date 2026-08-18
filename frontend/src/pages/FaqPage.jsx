import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Reveal, INK, MUTED, LINE } from "../components/ui.jsx";
import { useSeo } from "../lib/useSeo.js";

const FAQS = [
  {
    q: "Is every piece really handmade?",
    a: "Yes — every panel, mirror, and decor piece is hand-painted, carved, or assembled by hand in our workshop. Nothing is printed or mass-produced, so small variations in color and texture are part of each piece's character, not a flaw.",
  },
  {
    q: "How long does an order take to arrive?",
    a: "Orders are typically prepared and shipped within 3–5 business days. Delivery across Egypt usually takes an additional 2–4 business days depending on your location.",
  },
  {
    q: "Do you ship outside Egypt?",
    a: "At the moment we ship within Egypt only. If you're reaching out from abroad, message us on Instagram or through the Contact page and we'll see what we can arrange.",
  },
  {
    q: "Can I order a custom design or size?",
    a: "Many of our pieces — especially the mosaic mirrors — can be customized in color and size. Reach out via the Contact page with what you have in mind and we'll let you know what's possible.",
  },
  {
    q: "What payment methods do you accept?",
    a: "You can place an order directly through the site. Online card payment is available once checkout is completed; if it isn't active yet, we'll contact you directly to confirm payment after your order comes through.",
  },
  {
    q: "What if my item arrives damaged?",
    a: "Contact us within 48 hours of delivery with a photo of the item and packaging, and we'll sort out a replacement or refund.",
  },
  {
    q: "How should I care for a handmade wooden piece?",
    a: "Keep pieces away from direct sunlight and moisture, and dust gently with a soft, dry cloth. Avoid harsh chemical cleaners on painted or gilded surfaces.",
  },
];

function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${LINE}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-anim"
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "20px 4px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", fontFamily: "inherit" }}
      >
        <span style={{ fontSize: 15.5, fontWeight: 500, color: INK }}>{q}</span>
        <ChevronDown size={18} style={{ color: MUTED, flexShrink: 0, marginLeft: 12, transform: open ? "rotate(180deg)" : "none", transition: "transform .3s ease" }} />
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .3s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.9, margin: "0 4px 22px" }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  useSeo({
    title: "FAQ",
    description: "Answers to common questions about shipping, custom orders, payment, and caring for Zakhrafa's handmade wooden pieces.",
  });

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px 100px" }}>
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: MUTED, fontWeight: 600, marginBottom: 10 }}>FAQ</div>
          <h1 className="serif" style={{ fontSize: 34, fontWeight: 600, margin: 0 }}>Frequently Asked Questions</h1>
        </div>
      </Reveal>

      <Reveal>
        <div>
          {FAQS.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </div>
      </Reveal>

      <Reveal>
        <p style={{ textAlign: "center", color: MUTED, fontSize: 13.5, marginTop: 40 }}>
          Still have a question? <Link to="/contact" style={{ color: INK }}>Get in touch</Link>.
        </p>
      </Reveal>
    </div>
  );
}

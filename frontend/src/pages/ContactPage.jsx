import React, { useState } from "react";
import { Instagram, MessageCircle, Mail } from "lucide-react";
import { useStore } from "../lib/store.jsx";
import { Reveal, INK, MUTED, LINE } from "../components/ui.jsx";
import { useSeo } from "../lib/useSeo.js";

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  useSeo({
    title: "Contact Us",
    description: "Get in touch with Zakhrafa for questions about an order, a custom piece, or anything else.",
  });

  const { setToast, content } = useStore();
  const { email: contactEmail, instagram, responseTime } = content.contact;
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);

  // "@handle" reads better than the full URL next to the icon.
  const instagramHandle = instagram ? "@" + instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "") : "";

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setToast("Message sent! We'll get back to you soon.");
      setForm(initialForm);
    } catch (err) {
      setToast(err.message || "Something went wrong, please try again");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "60px 20px 100px" }}>
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 54 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: MUTED, fontWeight: 600, marginBottom: 10 }}>GET IN TOUCH</div>
          <h1 className="serif" style={{ fontSize: 34, fontWeight: 600, margin: 0 }}>Contact Us</h1>
          <p style={{ color: MUTED, marginTop: 14, fontSize: 14.5, maxWidth: 480, marginInline: "auto", lineHeight: 1.8 }}>
            Have a question about an order, a custom piece, or just want to say hello? Send us a message.
          </p>
        </div>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 50 }} className="product-detail-grid">
        <Reveal>
          <form onSubmit={handleSubmit}>
            <div className="zk-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input className="zk" required placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="zk" required type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <input className="zk" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <textarea className="zk" required rows={6} placeholder="Your Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button type="submit" disabled={sending} className="btn-anim" style={{ background: INK, color: "#fff", border: "none", borderRadius: 2, padding: "13px 30px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, letterSpacing: 0.5 }}>
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </Reveal>

        <Reveal delay={100}>
          <div style={{ borderLeft: `1px solid ${LINE}`, paddingLeft: 40 }} className="contact-aside">
            {contactEmail && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12.5, color: MUTED, letterSpacing: 0.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} /> Email</div>
                <a href={`mailto:${contactEmail}`} style={{ color: INK, textDecoration: "none", fontSize: 14.5 }}>{contactEmail}</a>
              </div>
            )}
            {instagram && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12.5, color: MUTED, letterSpacing: 0.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Instagram size={14} /> Instagram</div>
                <a href={instagram} target="_blank" rel="noreferrer" style={{ color: INK, textDecoration: "none", fontSize: 14.5 }}>{instagramHandle}</a>
              </div>
            )}
            {responseTime && (
              <div>
                <div style={{ fontSize: 12.5, color: MUTED, letterSpacing: 0.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><MessageCircle size={14} /> Response Time</div>
                <p style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.8, margin: 0 }}>{responseTime}</p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

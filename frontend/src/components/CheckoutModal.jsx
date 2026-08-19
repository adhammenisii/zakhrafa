import React, { useState } from "react";
import { X, Loader2, Tag, Check } from "lucide-react";
import { useStore, fmt } from "../lib/store.jsx";
import { GOVERNORATES, PAYMENT_METHODS, validateCheckout } from "../lib/checkoutFields.js";
import { INK, MUTED, LINE, BLUSH_DEEP, SURFACE } from "./ui.jsx";

const ERROR_RED = "#B4552F";

function Field({ id, label, optional, error, touched, children }) {
  const showError = touched && error;
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 500, color: INK, marginBottom: 6 }}>
        {label}
        {optional && <span style={{ color: MUTED, fontWeight: 400 }}> (optional)</span>}
        {!optional && <span style={{ color: BLUSH_DEEP }}> *</span>}
      </label>
      {children}
      {showError && <span style={{ color: ERROR_RED, fontSize: 11.5, marginTop: 5 }}>{error}</span>}
    </div>
  );
}

export default function CheckoutModal() {
  const {
    checkoutOpen, setCheckoutOpen, checkoutForm, setCheckoutForm,
    cartItems, cartSubtotal, cartTotal, placing, submitOrder,
    promo, promoInput, setPromoInput, promoStatus, promoError, applyPromo, clearPromo,
  } = useStore();

  const [touched, setTouched] = useState({});

  if (!checkoutOpen) return null;

  const errors = validateCheckout(checkoutForm);
  const isValid = Object.keys(errors).length === 0;

  const set = (field) => (e) => setCheckoutForm({ ...checkoutForm, [field]: e.target.value });
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const inputStyle = (field) => ({
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${touched[field] && errors[field] ? ERROR_RED : LINE}`,
    borderRadius: 4,
    fontFamily: "inherit",
    fontSize: 13.5,
    color: INK,
    background: "#fff",
    transition: "border-color .3s ease",
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) {
      // reveal every outstanding error at once rather than only the field just left
      setTouched(Object.fromEntries(Object.keys(errors).map((k) => [k, true])));
      return;
    }
    submitOrder(e);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 65, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={() => setCheckoutOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(38,34,32,0.45)" }} />

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          position: "relative", background: "#fff", width: "100%", maxWidth: 620,
          maxHeight: "92vh", borderRadius: 6, display: "flex", flexDirection: "column",
          boxShadow: "0 24px 60px rgba(20,12,10,0.28)",
        }}
      >
        {/* header (fixed) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 26px", borderBottom: `1px solid ${LINE}`, flexShrink: 0 }}>
          <div>
            <div className="serif" style={{ fontSize: 23, fontWeight: 600 }}>Checkout</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>Fields marked <span style={{ color: BLUSH_DEEP }}>*</span> are required</div>
          </div>
          <button type="button" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout" className="icon-btn" style={{ background: "none", border: "none", cursor: "pointer", color: INK, borderRadius: 999, padding: 7 }}>
            <X size={19} />
          </button>
        </div>

        {/* body (scrolls) */}
        <div style={{ overflowY: "auto", padding: "22px 26px", display: "flex", flexDirection: "column", gap: 26 }}>

          {/* order summary */}
          <section>
            <div style={{ fontSize: 11, letterSpacing: 2, color: MUTED, fontWeight: 600, marginBottom: 12 }}>ORDER SUMMARY</div>
            <div style={{ background: SURFACE, borderRadius: 5, padding: "14px 16px" }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5, marginBottom: 9 }}>
                  <span style={{ color: INK, minWidth: 0 }}>{item.name} <span style={{ color: MUTED }}>× {item.qty}</span></span>
                  <span style={{ whiteSpace: "nowrap" }}>{fmt(item.price * item.qty)}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${LINE}`, marginTop: 12, paddingTop: 11, display: "flex", flexDirection: "column", gap: 6 }}>
                {promo && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: MUTED }}>
                      <span>Subtotal</span><span>{fmt(cartSubtotal)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#2F6B2F" }}>
                      <span>Discount ({promo.code})</span><span>−{fmt(promo.discount)}</span>
                    </div>
                  </>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 15 }}>
                  <span>Total</span><span>{fmt(cartTotal)}</span>
                </div>
              </div>
            </div>

            {/* promo */}
            {promo ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#F6FBF6", border: "1px solid #CFE8CF", borderRadius: 4, padding: "9px 12px", marginTop: 12, fontSize: 12.5 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 7, color: "#2F6B2F", minWidth: 0 }}>
                  <Check size={14} style={{ flexShrink: 0 }} /> {promo.code} applied — {promo.label}
                </span>
                <button type="button" onClick={clearPromo} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 12, textDecoration: "underline", fontFamily: "inherit", flexShrink: 0 }}>
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
                    <Tag size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: MUTED }} />
                    <input
                      aria-label="Promo code"
                      placeholder="Promo code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      style={{ width: "100%", padding: "10px 12px 10px 32px", border: `1px solid ${LINE}`, borderRadius: 4, fontFamily: "inherit", fontSize: 13 }}
                    />
                  </div>
                  <button type="button" onClick={applyPromo} disabled={promoStatus === "checking" || !promoInput.trim()} className="btn-anim" style={{ background: "none", border: `1px solid ${INK}`, color: INK, borderRadius: 4, padding: "0 18px", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                    {promoStatus === "checking" ? "..." : "Apply"}
                  </button>
                </div>
                {promoStatus === "error" && <div style={{ color: ERROR_RED, fontSize: 11.5, marginTop: 6 }}>{promoError}</div>}
              </div>
            )}
          </section>

          {/* contact details */}
          <section>
            <div style={{ fontSize: 11, letterSpacing: 2, color: MUTED, fontWeight: 600, marginBottom: 14 }}>CONTACT DETAILS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field id="co-name" label="Full name" error={errors.name} touched={touched.name}>
                <input id="co-name" autoComplete="name" value={checkoutForm.name} onChange={set("name")} onBlur={blur("name")} style={inputStyle("name")} />
              </Field>
              <div className="checkout-row-2">
                <Field id="co-phone" label="Phone number" error={errors.phone} touched={touched.phone}>
                  <input id="co-phone" type="tel" autoComplete="tel" placeholder="01xxxxxxxxx" value={checkoutForm.phone} onChange={set("phone")} onBlur={blur("phone")} style={inputStyle("phone")} />
                </Field>
                <Field id="co-email" label="Email" optional error={errors.email} touched={touched.email}>
                  <input id="co-email" type="email" autoComplete="email" value={checkoutForm.email} onChange={set("email")} onBlur={blur("email")} style={inputStyle("email")} />
                </Field>
              </div>
            </div>
          </section>

          {/* delivery address */}
          <section>
            <div style={{ fontSize: 11, letterSpacing: 2, color: MUTED, fontWeight: 600, marginBottom: 14 }}>DELIVERY ADDRESS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field id="co-address" label="Street address" error={errors.address} touched={touched.address}>
                <textarea id="co-address" rows={2} autoComplete="street-address" placeholder="Building, street, apartment / floor" value={checkoutForm.address} onChange={set("address")} onBlur={blur("address")} style={{ ...inputStyle("address"), resize: "vertical" }} />
              </Field>
              <div className="checkout-row-3">
                <Field id="co-city" label="City" error={errors.city} touched={touched.city}>
                  <input id="co-city" autoComplete="address-level2" value={checkoutForm.city} onChange={set("city")} onBlur={blur("city")} style={inputStyle("city")} />
                </Field>
                <Field id="co-postal" label="Postal code" error={errors.postalCode} touched={touched.postalCode}>
                  <input id="co-postal" inputMode="numeric" autoComplete="postal-code" value={checkoutForm.postalCode} onChange={set("postalCode")} onBlur={blur("postalCode")} style={inputStyle("postalCode")} />
                </Field>
                <Field id="co-gov" label="Governorate" error={errors.governorate} touched={touched.governorate}>
                  <select id="co-gov" autoComplete="address-level1" value={checkoutForm.governorate} onChange={set("governorate")} onBlur={blur("governorate")} style={{ ...inputStyle("governorate"), appearance: "auto" }}>
                    <option value="">Select…</option>
                    {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
              <Field id="co-notes" label="Order notes" optional>
                <textarea id="co-notes" rows={3} placeholder="Special delivery instructions, landmarks, preferred delivery time…" value={checkoutForm.notes} onChange={set("notes")} style={{ ...inputStyle("notes"), resize: "vertical" }} />
              </Field>
            </div>
          </section>

          {/* payment method */}
          <section>
            <div style={{ fontSize: 11, letterSpacing: 2, color: MUTED, fontWeight: 600, marginBottom: 14 }}>PAYMENT METHOD</div>
            <div role="radiogroup" aria-label="Payment method" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PAYMENT_METHODS.map((m) => {
                const selected = checkoutForm.paymentMethod === m.id;
                return (
                  <label
                    key={m.id}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 11, cursor: "pointer",
                      border: `1px solid ${selected ? INK : LINE}`, borderRadius: 5, padding: "12px 14px",
                      background: selected ? SURFACE : "#fff", transition: "border-color .2s ease, background .2s ease",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={selected}
                      onChange={set("paymentMethod")}
                      style={{ marginTop: 2, accentColor: INK, flexShrink: 0 }}
                    />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: INK }}>{m.label}</span>
                      <span style={{ display: "block", fontSize: 12, color: MUTED, marginTop: 2 }}>{m.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {touched.paymentMethod && errors.paymentMethod && (
              <span style={{ color: ERROR_RED, fontSize: 11.5, marginTop: 6, display: "block" }}>{errors.paymentMethod}</span>
            )}
          </section>
        </div>

        {/* footer (fixed — total stays visible while scrolling) */}
        <div style={{ borderTop: `1px solid ${LINE}`, padding: "16px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0, background: "#fff", borderRadius: "0 0 6px 6px" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: MUTED }}>Total</div>
            <div style={{ fontSize: 19, fontWeight: 600 }}>{fmt(cartTotal)}</div>
          </div>
          <button
            type="submit"
            disabled={placing}
            className="btn-anim"
            style={{
              background: INK, color: "#fff", border: "none", borderRadius: 3, padding: "14px 30px",
              fontWeight: 500, cursor: placing ? "default" : "pointer", fontFamily: "inherit", fontSize: 13.5,
              letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              opacity: placing ? 0.85 : 1, flexShrink: 0,
            }}
          >
            {placing && <Loader2 size={16} className="spin" />}
            {placing ? "Placing order..." : "Confirm Order & Pay"}
          </button>
        </div>
      </form>
    </div>
  );
}

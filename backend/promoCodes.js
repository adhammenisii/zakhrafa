// Demo promo codes — swap this for a database-backed table if you need to manage codes without a redeploy.
const PROMO_CODES = {
  WELCOME10: { type: "percent", value: 10, label: "10% off your order" },
  ZAKHRAFA50: { type: "flat", value: 50, label: "EGP 50 off", minSubtotal: 500 },
};

// Returns { code, label, discount } for a valid code applied to `subtotal`, or null if the code
// doesn't exist or its conditions (e.g. minimum spend) aren't met.
export function resolvePromo(rawCode, subtotal) {
  if (!rawCode) return null;
  const code = String(rawCode).trim().toUpperCase();
  const promo = PROMO_CODES[code];
  if (!promo) return null;
  if (promo.minSubtotal && subtotal < promo.minSubtotal) return null;

  const discount = promo.type === "percent" ? Math.round(subtotal * (promo.value / 100)) : promo.value;
  return { code, label: promo.label, discount: Math.min(discount, subtotal) };
}

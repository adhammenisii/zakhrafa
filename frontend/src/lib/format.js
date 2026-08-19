export const fmt = (n) => "EGP " + Number(n || 0).toLocaleString("en-US");

// Customer-facing order reference (kept in sync with the admin panel's formatting).
export function orderRef(id) {
  return `ZKH-${String(id).padStart(5, "0")}`;
}

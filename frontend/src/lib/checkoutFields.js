// Egypt's governorates — the storefront ships domestically, so a picker beats free text.
export const GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Qalyubia", "Port Said", "Suez", "Luxor", "Aswan",
  "Asyut", "Beheira", "Beni Suef", "Dakahlia", "Damietta", "Fayoum", "Gharbia",
  "Ismailia", "Kafr El Sheikh", "Matrouh", "Minya", "Monufia", "New Valley",
  "North Sinai", "Qena", "Red Sea", "Sharqia", "Sohag", "South Sinai",
];

export const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", hint: "Pay the courier when your order arrives" },
  { id: "vodafone_cash", label: "Vodafone Cash", hint: "We'll send transfer details after you order" },
  { id: "card", label: "Card", hint: "Pay securely by debit or credit card" },
];

export const REQUIRED_FIELDS = ["name", "phone", "address", "city", "postalCode", "governorate", "paymentMethod"];

const LABELS = {
  name: "Full name",
  phone: "Phone number",
  address: "Street address",
  city: "City",
  postalCode: "Postal code",
  governorate: "Governorate",
  paymentMethod: "Payment method",
};

// Returns { field: message } for anything invalid; empty object means the form is good to submit.
export function validateCheckout(form) {
  const errors = {};

  for (const field of REQUIRED_FIELDS) {
    if (!String(form[field] || "").trim()) {
      errors[field] = `${LABELS[field]} is required`;
    }
  }

  const phone = String(form.phone || "").trim();
  if (phone && !/^[\d\s+()-]{7,}$/.test(phone)) {
    errors.phone = "Enter a valid phone number";
  }

  const email = String(form.email || "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  const postalCode = String(form.postalCode || "").trim();
  if (postalCode && !/^\d{4,10}$/.test(postalCode)) {
    errors.postalCode = "Postal code should be 4–10 digits";
  }

  return errors;
}

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RECENTLY_VIEWED_KEY, WISHLIST_KEY, RECENTLY_VIEWED_MAX } from "./constants.js";

// Re-exported so existing imports from "lib/store.jsx" keep working.
export { CATEGORIES } from "./constants.js";
export { fmt, orderRef } from "./format.js";

function loadIds(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => loadIds(WISHLIST_KEY));
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState(() => loadIds(RECENTLY_VIEWED_KEY));
  const [toast, setToast] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    governorate: "",
    notes: "",
    paymentMethod: "cod",
  });
  const [placing, setPlacing] = useState(false);
  const [promo, setPromo] = useState(null); // { code, label, discount }
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState(""); // "", "checking", "error"
  const [promoError, setPromoError] = useState("");
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch(() => setToast("Couldn't load products — make sure the server is running"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ ...products.find((p) => p.id === Number(id)), qty }))
    .filter((i) => i.id);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cartItems.reduce((s, i) => s + i.qty * i.price, 0);
  const cartTotal = Math.max(0, cartSubtotal - (promo?.discount || 0));

  const addToCart = (id) => {
    const p = products.find((p) => p.id === id);
    if (!p) return;
    const stock = p.stock ?? 0;

    // Decide before updating so the toast always matches what actually happened, and so we
    // never trigger a state update from inside another setter's updater (double-fires in StrictMode).
    if (stock <= 0) {
      setToast(`"${p.name}" is out of stock`);
      return;
    }
    if ((cart[id] || 0) + 1 > stock) {
      setToast(`Only ${stock} of "${p.name}" available`);
      return;
    }

    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    setToast(`Added "${p.name}" to cart`);
  };

  const changeQty = (id, delta) => {
    const p = products.find((p) => p.id === id);
    const stock = p?.stock ?? 0;
    const next = Math.max(0, (cart[id] || 0) + delta);
    if (delta > 0 && next > stock) {
      setToast(`Only ${stock} of "${p?.name ?? "this item"}" available`);
      return;
    }
    setCart((c) => ({ ...c, [id]: next }));
  };

  const isWishlisted = (id) => wishlist.includes(id);
  const toggleWishlist = (id) => {
    // Decide outside the updater — a setState call inside another setter's updater
    // double-fires under StrictMode.
    if (wishlist.includes(id)) {
      setWishlist((w) => w.filter((x) => x !== id));
      return;
    }
    const p = products.find((p) => p.id === id);
    setWishlist((w) => (w.includes(id) ? w : [...w, id]));
    if (p) setToast(`Added "${p.name}" to wishlist`);
  };
  const removeFromWishlist = (id) => setWishlist((w) => w.filter((x) => x !== id));
  const wishlistItems = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  const addRecentlyViewed = (id) => {
    setRecentlyViewed((list) => [id, ...list.filter((x) => x !== id)].slice(0, RECENTLY_VIEWED_MAX));
  };

  async function validatePromo(code, items) {
    const res = await fetch("/api/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, items: items.map((i) => ({ id: i.id, qty: i.qty })) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Couldn't apply that code");
    return data;
  }

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setPromoStatus("checking");
    setPromoError("");
    try {
      setPromo(await validatePromo(promoInput, cartItems));
      setPromoStatus("");
    } catch (err) {
      setPromo(null);
      setPromoStatus("error");
      setPromoError(err.message || "Couldn't apply that code");
    }
  }
  const clearPromo = () => {
    setPromo(null);
    setPromoInput("");
    setPromoStatus("");
    setPromoError("");
  };

  // A percentage discount is computed from the cart subtotal, so it goes stale the moment the
  // cart changes. Re-check it against the server, otherwise the customer sees one total and the
  // server (which recalculates on submit) charges another.
  const cartSignature = cartItems.map((i) => `${i.id}x${i.qty}`).join(",");
  const promoCodeRef = useRef(null);
  promoCodeRef.current = promo?.code || null;

  useEffect(() => {
    const code = promoCodeRef.current;
    if (!code) return;
    if (!cartItems.length) {
      clearPromo();
      return;
    }
    let cancelled = false;
    validatePromo(code, cartItems)
      .then((fresh) => { if (!cancelled) setPromo(fresh); })
      .catch(() => {
        if (cancelled) return;
        setPromo(null);
        setPromoStatus("error");
        setPromoError("That promo code no longer applies to this cart");
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSignature]);

  async function submitOrder(e) {
    e.preventDefault();
    if (placing) return; // guard against double-submit
    setPlacing(true);

    let order;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: checkoutForm,
          items: cartItems.map((i) => ({ id: i.id, qty: i.qty })),
          promoCode: promo?.code || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't place your order. Please try again.");
      order = data;
    } catch (err) {
      setToast(err.message || "Something went wrong, please try again");
      setPlacing(false);
      return;
    }

    // The order now exists. A failure past this point must NOT send the customer back to
    // the form — they'd re-submit and create a duplicate order.
    try {
      const payRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const payData = await payRes.json().catch(() => ({}));
      if (payRes.ok && payData.paymentUrl) {
        window.location.href = payData.paymentUrl;
        return;
      }
    } catch {
      // Payment gateway unreachable — the order still stands, so fall through to confirmation.
    }

    setLastOrder(order);
    setCart({});
    clearPromo();
    setCheckoutOpen(false);
    setCartOpen(false);
    setPlacing(false);
    navigate(`/order-confirmation/${order.id}`);
  }

  const value = {
    products,
    loading,
    cart,
    cartItems,
    cartCount,
    cartSubtotal,
    cartTotal,
    addToCart,
    changeQty,
    cartOpen,
    setCartOpen,
    wishlist,
    wishlistItems,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    wishlistOpen,
    setWishlistOpen,
    recentlyViewed,
    addRecentlyViewed,
    toast,
    setToast,
    checkoutOpen,
    setCheckoutOpen,
    checkoutForm,
    setCheckoutForm,
    placing,
    submitOrder,
    promo,
    promoInput,
    setPromoInput,
    promoStatus,
    promoError,
    applyPromo,
    clearPromo,
    lastOrder,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}

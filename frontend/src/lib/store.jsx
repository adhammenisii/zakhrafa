import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const CATEGORIES = [
  { id: "mosaic", label: "Mosaic Mirrors", img: "/images/products/mosaic-tiles.jpg" },
  { id: "pharaonic", label: "Pharaonic Art", img: "/images/products/nefertari.jpg" },
  { id: "ramadan", label: "Occasion Decor", img: "/images/products/ramadan.jpg" },
  { id: "oriental", label: "Oriental Panels", img: "/images/products/tray.jpg" },
];

export const fmt = (n) => "EGP " + n.toLocaleString("en-US");

export function orderRef(id) {
  return `ZKH-${String(id).padStart(5, "0")}`;
}

const RECENTLY_VIEWED_KEY = "zakhrafa_recently_viewed";
const WISHLIST_KEY = "zakhrafa_wishlist";
const RECENTLY_VIEWED_MAX = 8;

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
  const [checkoutForm, setCheckoutForm] = useState({ name: "", phone: "", address: "" });
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
    if ((p.stock ?? 0) <= 0) {
      setToast(`"${p.name}" is out of stock`);
      return;
    }
    setCart((c) => {
      const nextQty = (c[id] || 0) + 1;
      if (nextQty > p.stock) {
        setToast(`Only ${p.stock} of "${p.name}" available`);
        return c;
      }
      return { ...c, [id]: nextQty };
    });
    setToast(`Added "${p.name}" to cart`);
  };
  const changeQty = (id, delta) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + delta) }));

  const isWishlisted = (id) => wishlist.includes(id);
  const toggleWishlist = (id) => {
    setWishlist((w) => {
      if (w.includes(id)) return w.filter((x) => x !== id);
      const p = products.find((p) => p.id === id);
      if (p) setToast(`Added "${p.name}" to wishlist`);
      return [...w, id];
    });
  };
  const removeFromWishlist = (id) => setWishlist((w) => w.filter((x) => x !== id));
  const wishlistItems = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  const addRecentlyViewed = (id) => {
    setRecentlyViewed((list) => [id, ...list.filter((x) => x !== id)].slice(0, RECENTLY_VIEWED_MAX));
  };

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setPromoStatus("checking");
    setPromoError("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, items: cartItems.map((i) => ({ id: i.id, qty: i.qty })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPromo(data);
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

  async function submitOrder(e) {
    e.preventDefault();
    setPlacing(true);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // try to kick off online payment (returns a friendly error if Paymob isn't configured yet)
      const payRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.id }),
      });
      const payData = await payRes.json();

      if (payRes.ok && payData.paymentUrl) {
        window.location.href = payData.paymentUrl;
        return;
      }

      setLastOrder(data);
      setCart({});
      clearPromo();
      setCheckoutOpen(false);
      setCartOpen(false);
      navigate(`/order-confirmation/${data.id}`);
    } catch (err) {
      setToast(err.message || "Something went wrong, please try again");
    } finally {
      setPlacing(false);
    }
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

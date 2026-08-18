import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { StoreProvider } from "./lib/store.jsx";
import { INK, LINE, SURFACE } from "./components/ui.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import WishlistDrawer from "./components/WishlistDrawer.jsx";
import CheckoutModal from "./components/CheckoutModal.jsx";
import Toast from "./components/Toast.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import FaqPage from "./pages/FaqPage.jsx";
import OrderConfirmationPage from "./pages/OrderConfirmationPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import FloatingWhatsApp from "./components/FloatingWhatsApp.jsx";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return; // let anchor links (e.g. /#shop) handle their own scroll
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export default function ZakhrafaStore() {
  return (
    <StoreProvider>
      <div style={{ fontFamily: "'Jost', sans-serif", background: "#FFFFFF", color: INK, minHeight: "100vh" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap');
          html, body { max-width: 100%; overflow-x: hidden; }
          *, *::before, *::after { box-sizing: border-box; }
          img, svg { max-width: 100%; }
          h1, h2, h3, p { overflow-wrap: break-word; }
          .serif { font-family: 'Cormorant Garamond', serif; }

          /* cards */
          .product-card { transition: transform .3s ease, box-shadow .3s ease; will-change: transform; }
          .product-card:hover { transform: translateY(-4px) scale(1.015); box-shadow: 0 16px 32px rgba(43,36,32,0.14); }
          .product-card img, .banner-img { transition: transform .5s ease; }
          .product-card:hover img { transform: scale(1.06); }
          .banner { transition: box-shadow .3s ease; }
          .banner:hover { box-shadow: 0 16px 32px rgba(43,36,32,0.14); }
          .banner:hover .banner-img { transform: scale(1.06); }

          /* buttons */
          button, a { transition: background-color .3s ease, color .3s ease, border-color .3s ease, transform .3s ease, box-shadow .3s ease, opacity .3s ease; }
          .btn-anim:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(43,36,32,0.16); }
          .btn-anim:active { transform: translateY(0); box-shadow: none; }
          .cat-pill:hover { border-color: ${INK}; }
          .icon-btn:hover { background: ${SURFACE}; transform: translateY(-2px); }
          .whatsapp-fab:hover { transform: scale(1.08); box-shadow: 0 8px 26px rgba(37,211,102,0.55) !important; }
          @media (max-width: 640px) { .whatsapp-fab { bottom: 16px !important; right: 16px !important; width: 50px !important; height: 50px !important; } }
          .crumb-link:hover { color: ${INK}; }

          .nav-link { position: relative; }
          .nav-link::after { content: ""; position: absolute; left: 0; bottom: -6px; width: 0; height: 1px; background: ${INK}; transition: width .3s ease; }
          .nav-link:hover::after { width: 100%; }

          @keyframes slideIn { from { transform: translateX(105%); } to { transform: translateX(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
          .spin { animation: spin .8s linear infinite; }
          @keyframes fadeUp { from { opacity:0; transform: translateY(6px);} to {opacity:1; transform:translateY(0);} }
          .toast-anim { animation: fadeUp .2s ease; }

          /* scroll reveal */
          .reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s ease, transform .7s ease; }
          .reveal-visible { opacity: 1; transform: translateY(0); }

          /* image skeleton shimmer */
          .skeleton-shimmer {
            background: linear-gradient(100deg, ${SURFACE} 30%, #EFE6DE 45%, ${SURFACE} 60%);
            background-size: 250% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
          }
          @keyframes shimmer { 0% { background-position: 120% 0; } 100% { background-position: -20% 0; } }

          input.zk, textarea.zk { width: 100%; padding: 10px 12px; border: 1px solid ${LINE}; border-radius: 4px; margin-bottom: 12px; font-family: inherit; font-size: 13.5px; transition: border-color .3s ease; }
          input.zk:focus, textarea.zk:focus { border-color: ${INK}; outline: none; }

          @media (prefers-reduced-motion: reduce) {
            .product-card, .banner-img, .banner, button, a, .reveal { transition: none !important; animation: none !important; }
            .reveal { opacity: 1 !important; transform: none !important; }
          }

          .site-nav { display: flex; gap: 26px; }
          @media (max-width: 640px) {
            .header-row { flex-wrap: wrap; row-gap: 10px; }
            .site-nav { order: 3; width: 100%; justify-content: center; gap: 16px; font-size: 12.5px !important; }
            .product-detail-grid { grid-template-columns: 1fr !important; }
            .contact-aside { border-left: none !important; border-top: 1px solid ${LINE}; padding-left: 0 !important; padding-top: 30px; margin-top: 10px; }
            .collection-grid { grid-template-columns: 1fr !important; }
            .collection-text { padding: 30px 22px !important; }
            .collection-photo { height: 240px !important; order: -1; }
          }

          @media (max-width: 480px) {
            .zk-form-row { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <ScrollToTop />
        <Header />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <Footer />

        <CartDrawer />
        <WishlistDrawer />
        <CheckoutModal />
        <Toast />
        <FloatingWhatsApp />
      </div>
    </StoreProvider>
  );
}

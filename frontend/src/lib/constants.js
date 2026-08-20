// Used until /api/categories responds, and as a fallback if it can't be reached, so the
// homepage never renders an empty category strip.
export const CATEGORIES = [
  { id: "mosaic", slug: "mosaic", label: "Mosaic Mirrors", img: "/images/products/mosaic-tiles.jpg" },
  { id: "pharaonic", slug: "pharaonic", label: "Pharaonic Art", img: "/images/products/nefertari.jpg" },
  { id: "ramadan", slug: "ramadan", label: "Occasion Decor", img: "/images/products/ramadan.jpg" },
  { id: "oriental", slug: "oriental", label: "Oriental Panels", img: "/images/products/tray.jpg" },
];

// Same idea for the editable copy: these mirror the values seeded into the settings table,
// so the first paint matches what the server is about to send.
export const DEFAULT_CONTENT = {
  hero: {
    eyebrow: "HANDMADE · EGYPT",
    title: "Where Wood Meets Art",
    subtitle:
      "Oriental and Pharaonic-inspired wooden pieces, painted and finished entirely by hand — for an authentic touch in your space.",
    ctaLabel: "Shop the Collection",
    image: "/images/products/tray-hero.jpg",
  },
  about: {
    heroImage: "/images/products/panel.jpg",
    intro:
      "Zakhrafa started with a simple passion for wood and color. What began as one person's love for hand-painting and carving grew, piece by piece, into a small workshop dedicated to turning raw wood into art. Today every panel, mirror, and decor piece we make is still shaped entirely by hand — no printing, no molds, no mass production — so no two pieces are ever quite the same.",
    storyTitle: "Handmade with Heart",
    storyText:
      "Zakhrafa started with a simple passion for wood and color, and grew into a small workshop turning raw material into art. Every piece is shaped by brush and chisel — no printing, no mass production — inspired by Egypt's layered Pharaonic and Oriental heritage.",
    cards: [
      {
        title: "What is Zakhrafa?",
        body: "Zakhrafa is an Egyptian brand dedicated to fully handmade wooden pieces — painted panels, mosaic mirrors, and occasion decor. Every piece is hand-painted and finished by a craftsperson, so no two pieces are ever quite the same.",
        image: "/images/products/mosaic-tiles.jpg",
      },
      {
        title: "Who's Behind Zakhrafa?",
        body: "A passion for wood and color that grew into a small workshop turning raw material into art. Every design is shaped by brush and chisel — no printing, no mass production.",
        image: "/images/products/ramadan.jpg",
      },
      {
        title: "Why Zakhrafa?",
        body: "Our inspiration comes from Egypt's layered artistic heritage — Pharaonic and Oriental alike — translated into modern decor for your home, or a gift with a truly authentic identity.",
        image: "/images/products/nefertari.jpg",
      },
    ],
  },
  contact: {
    email: "hello@zakhrafa-handmade.com",
    whatsapp: "201000000000",
    instagram: "https://instagram.com/zakhrafa_handmade",
    facebook: "https://facebook.com/zakhrafahandmade",
    responseTime: "We usually reply within 1–2 business days.",
  },
  faqs: [],
};

export const RECENTLY_VIEWED_KEY = "zakhrafa_recently_viewed";
export const WISHLIST_KEY = "zakhrafa_wishlist";
export const RECENTLY_VIEWED_MAX = 8;

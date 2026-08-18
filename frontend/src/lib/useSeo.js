import { useEffect } from "react";

const SITE_NAME = "Zakhrafa Handmade";

function setMetaByAttr(attr, key, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

// Updates document.title + meta description/OG tags/robots for the current page.
// SPA-only (no server-side rendering), but covers JS-executing crawlers and social link previews.
export function useSeo({ title, description, image, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Handmade Wooden Art`;
    document.title = fullTitle;

    setMetaByAttr("name", "description", description);
    setMetaByAttr("property", "og:title", fullTitle);
    setMetaByAttr("property", "og:description", description);
    setMetaByAttr("property", "og:url", window.location.href);
    if (image) setMetaByAttr("property", "og:image", image);

    setMetaByAttr("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
  }, [title, description, image, noindex]);
}

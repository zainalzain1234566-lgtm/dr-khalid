"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Arriving from another page at /#section, the browser's native jump happens before
 * hydration, images and ScrollTrigger pin spacers settle, so it lands at the top.
 * Re-apply the jump once the page has loaded and ScrollTrigger has laid out.
 */
export default function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const go = () => {
      ScrollTrigger.refresh();
      document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
    };
    if (document.readyState === "complete") requestAnimationFrame(go);
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);
  return null;
}

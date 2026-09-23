"use client";

import Image from "next/image";
import { useRef } from "react";
import { MOTION_OK, gsap, useGSAP } from "./gsap";

/**
 * GSAP island (no Motion inside): the photo's frame opens from the inline-start edge
 * while the image drifts and settles as the section scrolls past, giving the lab depth
 * while the benefits list is read. Static under reduced motion.
 */
export default function ScrubPhoto({ src, alt, className }: { src: string; alt: string; className: string }) {
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rtl = document.documentElement.dir === "rtl";
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from(frame.current, {
          clipPath: rtl ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: frame.current, start: "top 80%", once: true },
        });
        gsap.fromTo(
          ".scrub-img",
          { yPercent: -8, scale: 1.15 },
          {
            yPercent: 8,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: frame },
  );

  return (
    <div ref={frame} className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes="50vw" className="scrub-img object-cover will-change-transform" />
    </div>
  );
}

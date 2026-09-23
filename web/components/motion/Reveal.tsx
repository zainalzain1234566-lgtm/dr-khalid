"use client";

import { useRef, type ReactNode } from "react";
import { MOTION_OK, gsap, onceInView, useGSAP } from "./gsap";
import { RISE } from "./tokens";

/** Fades in and rises 20px the first time it scrolls into view. */
export default function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      gsap.from(ref.current, { opacity: 0, y: RISE, delay, scrollTrigger: onceInView(ref.current!) });
    });
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

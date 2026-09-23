"use client";

import { useRef, type ReactNode } from "react";
import { MOTION_OK, gsap, useGSAP } from "./gsap";
import { useDir } from "./MotionProvider";
import { DURATION, RISE } from "./tokens";

/**
 * Hero intro as one timeline: the arch settles, copy staggers in over it,
 * then the name card slides from the inline-start side.
 * Items and card start hidden via globals.css so SSR HTML never flashes before hydration.
 * Targets: [data-hero="arch"], [data-hero="item"], [data-hero="card"].
 */
export default function HeroIntro({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { fromStart } = useDir();

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap
          .timeline()
          .addLabel("arch")
          .from('[data-hero="arch"]', { scale: 0.9, transformOrigin: "50% 100%", duration: DURATION.slow }, "arch")
          .fromTo('[data-hero="item"]', { autoAlpha: 0, y: RISE }, { autoAlpha: 1, y: 0, stagger: 0.08 }, "arch+=0.1")
          .fromTo('[data-hero="card"]', { autoAlpha: 0, x: fromStart(24) }, { autoAlpha: 1, x: 0 }, "arch+=0.4");
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="top" className={className}>
      {children}
    </section>
  );
}

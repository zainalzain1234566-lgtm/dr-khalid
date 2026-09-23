"use client";

import { useRef, type ReactNode } from "react";
import { MOTION_OK, gsap, useGSAP } from "./gsap";

/**
 * Desktop only: pins the section and lights up each [data-step-badge] in turn as the
 * viewer scrolls, so the list reads one step at a time. Static on mobile / reduced motion.
 */
export default function PinSteps({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current!;
      gsap.matchMedia().add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        const badges = gsap.utils.toArray<HTMLElement>("[data-step-badge]", root);
        const css = getComputedStyle(root);
        const on = { backgroundColor: css.getPropertyValue("--brand-500").trim(), color: "#fff", scale: 1.12 };

        gsap
          .timeline({
            defaults: { ease: "none", duration: 1 },
            scrollTrigger: {
              trigger: root,
              // Taller than the viewport: pin once the last row is fully visible.
              start: () => (root.offsetHeight > innerHeight ? "bottom bottom" : "center center"),
              end: () => `+=${badges.length * 90}`,
              pin: true,
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          })
          .to(badges, { ...on, stagger: 1 });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}

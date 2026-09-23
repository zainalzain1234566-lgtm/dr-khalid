"use client";

import { useRef, type HTMLAttributes, type ReactNode } from "react";
import { MOTION_OK, gsap, onceInView, useGSAP } from "./gsap";
import { RISE } from "./tokens";

/** Staggers its <StaggerItem> descendants 0.08s apart in one timeline, on first scroll into view. */
export default function Stagger({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const root = ref.current!;
    // Skip items owned by a nested <Stagger>.
    const items = gsap.utils
      .toArray<HTMLElement>("[data-stagger-item]", root)
      .filter((el) => el.closest("[data-stagger]") === root);

    gsap.matchMedia().add(MOTION_OK, () => {
      gsap
        .timeline({ scrollTrigger: onceInView(root) })
        // opacity, not autoAlpha: items must stay clickable while still fading in.
        .from(items, { opacity: 0, y: RISE, stagger: 0.08 }, delay);
    });
  });

  return (
    <div ref={ref} data-stagger className={className}>
      {children}
    </div>
  );
}

export function StaggerItem({ children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div data-stagger-item {...props}>
      {children}
    </div>
  );
}

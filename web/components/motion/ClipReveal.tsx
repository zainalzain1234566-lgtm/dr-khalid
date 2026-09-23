"use client";

import { useRef, type ReactNode } from "react";
import { MOTION_OK, gsap, onceInView, useGSAP } from "./gsap";
import { useDir } from "./MotionProvider";
import { DURATION } from "./tokens";

/** Wipes its content into view from the inline-start side. */
export default function ClipReveal({ children, className }: { children: ReactNode; className?: string }) {
  const { isRtl } = useDir();
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      // inset(top right bottom left): hide everything except the start edge, then open up.
      // The outer box is observed: a fully clipped element never counts as "in view".
      gsap.from(inner.current, {
        clipPath: isRtl ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
        duration: DURATION.slow,
        scrollTrigger: onceInView(outer.current!),
      });
    });
  });

  return (
    <div ref={outer} className={className}>
      <div ref={inner} className="size-full">
        {children}
      </div>
    </div>
  );
}

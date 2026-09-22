"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useDir } from "./MotionProvider";
import { DURATION, EASE, VIEWPORT } from "./tokens";

/** Wipes its content into view from the inline-start side. */
export default function ClipReveal({ children, className }: { children: ReactNode; className?: string }) {
  const { isRtl } = useDir();
  const reduce = useReducedMotion();
  // inset(top right bottom left): hide everything except the start edge, then open up.
  const hidden = isRtl ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";

  // The outer box is what's observed: a fully clipped element never counts as "in view".
  return (
    <m.div className={className} initial="hidden" whileInView="show" viewport={VIEWPORT}>
      <m.div
        className="size-full"
        variants={{
          hidden: { clipPath: hidden },
          show: { clipPath: "inset(0 0 0 0)" },
        }}
        transition={{ duration: reduce ? 0 : DURATION.slow, ease: EASE }}
      >
        {children}
      </m.div>
    </m.div>
  );
}

"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE, RISE, VIEWPORT } from "./tokens";

/** Fades in and rises 20px the first time it scrolls into view. */
export default function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: RISE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DURATION.base, ease: EASE, delay }}
    >
      {children}
    </m.div>
  );
}

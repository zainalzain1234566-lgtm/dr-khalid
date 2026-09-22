"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { useDir } from "./MotionProvider";
import { DURATION, EASE } from "./tokens";

/** Soft arch behind Dr. Khalid: settles from 0.9 to 1 on load. */
export function HeroArch({ className }: { className: string }) {
  return (
    <m.div
      className={className}
      style={{ transformOrigin: "50% 100%" }}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: DURATION.slow, ease: EASE }}
    />
  );
}

/** Floating name card: slides in from the inline-start side after 0.4s. */
export function HeroCard({ className, children }: { className: string; children: ReactNode }) {
  const { fromStart } = useDir();
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, x: fromStart(24) }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: DURATION.base, ease: EASE, delay: 0.4 }}
    >
      {children}
    </m.div>
  );
}

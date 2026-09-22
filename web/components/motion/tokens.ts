import type { Variants } from "motion/react";

/** Calm, no-overshoot easing used everywhere. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = { fast: 0.3, base: 0.5, slow: 0.6 } as const;

/** Scroll reveals fire once, when 20% of the element is visible. */
export const VIEWPORT = { once: true, amount: 0.2 } as const;

export const RISE = 20;

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: RISE },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};

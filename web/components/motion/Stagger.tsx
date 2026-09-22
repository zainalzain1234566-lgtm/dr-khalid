"use client";

import { m, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE, VIEWPORT, itemVariants } from "./tokens";

/**
 * Staggers its <StaggerItem> children 0.08s apart.
 * `onLoad` plays on mount (above-the-fold content); otherwise on first scroll into view.
 */
export default function Stagger({
  children,
  className,
  delay = 0,
  onLoad = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  onLoad?: boolean;
}) {
  const trigger = onLoad ? { animate: "show" } : { whileInView: "show", viewport: VIEWPORT };
  return (
    <m.div
      className={className}
      initial="hidden"
      {...trigger}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: delay } },
      }}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div"> & { children: ReactNode }) {
  return (
    // `transition` covers hover/tap gestures; the reveal uses the variant's own transition.
    <m.div variants={itemVariants} transition={{ duration: DURATION.fast, ease: EASE }} {...props}>
      {children}
    </m.div>
  );
}

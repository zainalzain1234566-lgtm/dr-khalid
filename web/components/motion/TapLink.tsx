"use client";

import { m, type HTMLMotionProps } from "motion/react";
import { DURATION, EASE } from "./tokens";

/** CTA link: presses to 0.97 on tap; `lift` adds a 2px hover lift. */
export default function TapLink({ lift = false, ...props }: HTMLMotionProps<"a"> & { lift?: boolean }) {
  return (
    <m.a
      whileTap={{ scale: 0.97 }}
      whileHover={lift ? { y: -2 } : undefined}
      transition={{ duration: DURATION.fast, ease: EASE }}
      {...props}
    />
  );
}

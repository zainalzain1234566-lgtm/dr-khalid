"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { createContext, useContext, type ReactNode } from "react";
import { DURATION, EASE } from "./tokens";

export type Dir = "rtl" | "ltr";

const DirContext = createContext<Dir>("rtl");

/**
 * Reading direction for motion offsets.
 * `fromStart(d)` is the x offset an element starts at when it enters from the
 * inline-start side: +d in RTL (start is on the right), -d in LTR.
 */
export function useDir() {
  const dir = useContext(DirContext);
  const isRtl = dir === "rtl";
  return { dir, isRtl, fromStart: (d = 24) => (isRtl ? d : -d) };
}

export default function MotionProvider({ dir, children }: { dir: Dir; children: ReactNode }) {
  return (
    <DirContext.Provider value={dir}>
      {/* Default tween (never a spring) so nothing overshoots. */}
      <MotionConfig reducedMotion="user" transition={{ duration: DURATION.base, ease: EASE }}>
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      </MotionConfig>
    </DirContext.Provider>
  );
}

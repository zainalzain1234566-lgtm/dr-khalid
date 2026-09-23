"use client";

import Image from "next/image";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { EASE } from "./motion/tokens";

type Props = {
  before: string | null;
  after: string | null;
  label: string;
  beforeLabel: string;
  afterLabel: string;
  beforeAlt: string;
  afterAlt: string;
  aspect?: string;
  sizes?: string;
};

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/**
 * Draggable before/after comparison (mouse, touch, keyboard).
 * Always laid out LTR — "before" on the left — so it behaves identically in RTL and LTR.
 */
export default function BeforeAfterSlider({ before, after, label, beforeLabel, afterLabel, beforeAlt, afterAlt, aspect = "aspect-[4/5]", sizes = "(min-width: 1024px) 384px, 350px" }: Props) {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const touched = useRef(false);
  const nudge = useRef<{ stop: () => void } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const placeholder = !before || !after;

  // One gentle ±8% nudge the first time it's seen, to hint that it's draggable
  // (three 0.5s legs: right, left, back to centre).
  useEffect(() => {
    if (!inView || reduce || touched.current) return;
    const controls = animate(50, [50, 58, 42, 50], { duration: 1.5, ease: EASE, delay: 0.3, onUpdate: setPos });
    nudge.current = controls;
    return () => controls.stop();
  }, [inView, reduce]);

  const interrupt = () => {
    touched.current = true;
    nudge.current?.stop();
  };

  const update = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos(clamp(((e.clientX - r.left) / r.width) * 100));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    interrupt();
    const step = e.shiftKey ? 10 : 2;
    const next: Record<string, number> = {
      ArrowLeft: pos - step,
      ArrowDown: pos - step,
      ArrowRight: pos + step,
      ArrowUp: pos + step,
      Home: 0,
      End: 100,
    };
    if (e.key in next) {
      e.preventDefault();
      setPos(clamp(next[e.key]));
    }
  };

  return (
    <div
      dir="ltr"
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      onKeyDown={onKeyDown}
      ref={root}
      onPointerDown={(e) => {
        interrupt();
        e.currentTarget.setPointerCapture(e.pointerId);
        dragging.current = true;
        update(e);
      }}
      onPointerMove={(e) => dragging.current && update(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      className={`relative ${aspect} cursor-ew-resize touch-none overflow-hidden rounded-[inherit] bg-line select-none focus-visible:ring-[3px] focus-visible:ring-brand-700 focus-visible:outline-none`}
    >
      {placeholder ? (
        <>
          <div className="placeholder-stripes-brand absolute inset-0" />
          <div className="placeholder-stripes absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
          <div className="absolute inset-0 flex items-center justify-around font-mono text-xs font-medium text-ink-500 lg:text-[13px]">
            <span>[ before ]</span>
            <span>[ after ]</span>
          </div>
        </>
      ) : (
        <>
          <Image
            src={after}
            alt={afterAlt}
            fill
            sizes={sizes}
            className="pointer-events-none object-cover"
            draggable={false}
          />
          <Image
            src={before}
            alt={beforeAlt}
            fill
            sizes={sizes}
            className="pointer-events-none object-cover"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            draggable={false}
          />
        </>
      )}

      {/* Handle: a full-width layer moved with a transform, so translateX(%) tracks the container width. */}
      <div className="pointer-events-none absolute inset-0" style={{ transform: `translateX(${pos}%)` }} aria-hidden="true">
        <div className="absolute inset-y-0 left-0 w-0.5 -translate-x-px bg-white" />
        <div className="absolute top-1/2 left-0 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white font-bold text-brand-500 lg:size-12 lg:text-lg lg:shadow-[0_8px_28px_rgba(31,35,40,0.2)]">
          ‹ ›
        </div>
      </div>
      <span className="absolute top-3 left-3 rounded-full bg-white/92 px-2.5 py-[3px] text-xs font-semibold text-ink-900 lg:top-4 lg:left-4 lg:px-3 lg:py-1 lg:text-[13px]">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 rounded-full bg-white/92 px-2.5 py-[3px] text-xs font-semibold text-ink-900 lg:top-4 lg:right-4 lg:px-3 lg:py-1 lg:text-[13px]">
        {afterLabel}
      </span>
    </div>
  );
}

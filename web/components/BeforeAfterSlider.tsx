"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type Props = {
  before: string | null;
  after: string | null;
  label: string;
  beforeLabel: string;
  afterLabel: string;
  beforeAlt: string;
  afterAlt: string;
};

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/**
 * Draggable before/after comparison (mouse, touch, keyboard).
 * Always laid out LTR — "before" on the left — so it behaves identically in RTL and LTR.
 */
export default function BeforeAfterSlider({ before, after, label, beforeLabel, afterLabel, beforeAlt, afterAlt }: Props) {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const placeholder = !before || !after;

  const update = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos(clamp(((e.clientX - r.left) / r.width) * 100));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragging.current = true;
        update(e);
      }}
      onPointerMove={(e) => dragging.current && update(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      className="relative aspect-[4/5] cursor-ew-resize touch-none overflow-hidden rounded-lg bg-line select-none focus-visible:ring-[3px] focus-visible:ring-brand-700 focus-visible:outline-none"
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
          <Image src={after} alt={afterAlt} fill sizes="(min-width: 1024px) 384px, 350px" className="pointer-events-none object-cover" draggable={false} />
          <Image
            src={before}
            alt={beforeAlt}
            fill
            sizes="(min-width: 1024px) 384px, 350px"
            className="pointer-events-none object-cover"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            draggable={false}
          />
        </>
      )}

      <div className="absolute inset-y-0 w-0.5 -translate-x-px bg-white" style={{ left: `${pos}%` }} />
      <div
        className="absolute top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white font-bold text-brand-500 lg:size-12 lg:text-lg lg:shadow-[0_8px_28px_rgba(31,35,40,0.2)]"
        style={{ left: `${pos}%` }}
        aria-hidden="true"
      >
        ‹ ›
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

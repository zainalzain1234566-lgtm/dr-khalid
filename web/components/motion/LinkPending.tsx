"use client";

import { useLinkStatus } from "next/link";

/**
 * Covers its parent <Link> with a soft veil + spinner while that navigation is pending.
 * Always rendered (opacity toggle, no layout shift); the short delay skips it for fast navigations.
 * Parent must be `relative`.
 */
export default function LinkPending() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-surface/70 transition-opacity duration-300 ${pending ? "opacity-100 delay-100" : "opacity-0"}`}
    >
      <span className="size-7 rounded-full border-[2.5px] border-brand-100 border-t-brand-500 motion-safe:animate-spin" />
    </span>
  );
}

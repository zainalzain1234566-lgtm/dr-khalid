import type { ReactNode } from "react";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex w-max items-center gap-2 rounded-full bg-brand-100/70 px-3 py-1 text-xs font-semibold tracking-wide text-brand-700 ring-1 ring-brand-500/15 ${className}`}
    >
      <i className="size-1.5 rounded-full bg-brand-500" />
      {children}
    </span>
  );
}

/** Trailing icon nested in its own circle, flush to the button's end padding. Parent needs `group`. */
export function CtaIcon({ className = "bg-black/10" }: { className?: string }) {
  return (
    <span
      className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-fluid group-hover:scale-105 group-hover:-translate-y-px group-hover:-translate-x-1 ltr:group-hover:translate-x-1 ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 rtl:-scale-x-100">
        <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-heading text-[28px] leading-[1.2] font-bold text-balance text-ink-900 lg:text-[44px] lg:leading-[1.15] ${className}`}>{children}</h2>
  );
}

export function Stars({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span role="img" aria-label={label} dir="ltr" className={`text-warning ${className}`}>
      ★★★★★
    </span>
  );
}

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.02c-.25.69-1.44 1.32-2 1.37-.51.05-1.16.07-1.87-.12-.43-.14-.99-.32-1.7-.63-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.22-1.62-1.22-3.09 0-1.47.77-2.19 1.04-2.49.27-.3.6-.37.8-.37h.57c.18.01.43-.07.67.51.25.6.84 2.07.92 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.77 1.27 1.66 2.06 1.14 1.02 2.1 1.33 2.4 1.48.3.15.47.12.65-.07.17-.2.74-.87.94-1.17.2-.3.4-.25.67-.15.27.1 1.74.82 2.04.97.3.15.5.22.57.35.08.12.08.72-.17 1.4Z" />
    </svg>
  );
}

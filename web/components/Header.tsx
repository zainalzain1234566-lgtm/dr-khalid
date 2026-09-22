"use client";

import Image from "next/image";
import { useState } from "react";
import t from "@/messages/ar.json";
import { whatsappHref } from "@/lib/site";

const h = t.header;

function LangSwitch({ className = "" }: { className?: string }) {
  // TODO: link to /en once the English (LTR) version is designed.
  return (
    <span dir="ltr" className={`rounded-full border border-line font-semibold text-ink-700 ${className}`}>
      {h.langSwitch}
    </span>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <header className="relative z-[2] mx-auto hidden max-w-[1264px] items-center justify-between px-8 py-5 lg:flex">
        <a href="#top" className="flex items-center gap-3.5">
          <Image src="/logo.webp" alt={h.logoAlt} width={50} height={48} className="h-12 w-auto" priority />
          <span className="flex flex-col">
            <span className="font-heading text-lg font-bold text-ink-900">{h.clinicName}</span>
            <span className="text-[13px] text-ink-500">{h.clinicTagline}</span>
          </span>
        </a>
        <nav className="flex gap-8 text-base font-medium">
          {h.nav.map((item) => (
            <a key={item.href} href={item.href} className="text-ink-700 hover:text-brand-700">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitch className="px-3.5 py-2 text-sm" />
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener"
            className="flex h-12 items-center rounded-full bg-brand-500 px-7 text-base font-semibold text-white transition hover:text-white hover:-translate-y-0.5 hover:bg-brand-600"
          >
            {h.book}
          </a>
        </div>
      </header>

      {/* Mobile */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 lg:hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <a href="#top" className="flex items-center gap-2.5">
            <Image src="/logo.webp" alt={h.logoAlt} width={41} height={40} className="h-10 w-auto" priority />
            <b className="font-heading text-[15px] font-bold text-ink-900">{h.mobileName}</b>
          </a>
          <div className="flex items-center gap-2">
            <LangSwitch className="px-2.5 py-1.5 text-[13px]" />
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? h.menuClose : h.menuOpen}
              className="flex size-11 flex-col items-center justify-center gap-1 rounded-full border border-line"
            >
              <i className="h-0.5 w-[18px] bg-ink-900" />
              <i className="h-0.5 w-[18px] bg-ink-900" />
            </button>
          </div>
        </div>
        {open && (
          <nav id="mobile-nav" className="flex flex-col border-t border-line px-5 pb-3">
            {h.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3.5 text-base font-medium text-ink-700 last:border-b-0"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}

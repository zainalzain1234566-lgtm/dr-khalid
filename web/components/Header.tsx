"use client";

import Image from "next/image";
import { useState } from "react";
import ar from "@/messages/ar.json";
import { isAr, type Messages } from "@/lib/i18n";
import { whatsappHref } from "@/lib/site";
import ThemeToggle from "./ThemeToggle";
import TapLink from "./motion/TapLink";
import { CtaIcon } from "./ui";

function LangSwitch({ h, className = "" }: { h: Messages["header"]; className?: string }) {
  return (
    <a
      href={h.langHref}
      lang={h.langCode}
      dir="ltr"
      className={`flex min-h-11 items-center rounded-full border border-line font-semibold whitespace-nowrap text-ink-700 hover:text-brand-700 ${className}`}
    >
      {h.langSwitch}
    </a>
  );
}

export default function Header({ t = ar }: { t?: Messages }) {
  const h = t.header;
  const [open, setOpen] = useState(false);
  // Logo goes to the top of the home page, from any page (#top alone only works on home).
  const home = isAr(t) ? "/#top" : "/en#top";

  return (
    <>
      {/* Desktop: floating glass island, detached from the top edge */}
      <header className="sticky top-5 z-30 mx-auto mt-5 hidden w-max items-center gap-10 rounded-full bg-bg/75 py-2 ps-3 pe-2 shadow-md ring-1 ring-ink-900/5 backdrop-blur-xl lg:flex">
        <a href={home} className="flex items-center gap-3">
          <Image src="/logo.webp" alt={h.logoAlt} width={50} height={48} className="h-10 w-auto" priority />
          <span className="flex flex-col leading-tight">
            <span className="font-heading text-[15px] font-bold text-ink-900">{h.clinicName}</span>
            <span className="text-xs text-ink-500">{h.clinicTagline}</span>
          </span>
        </a>
        <nav className="flex gap-7 text-[15px] font-medium">
          {h.nav.map((item) => (
            <a key={item.href} href={item.href} className="text-ink-700 transition-colors duration-500 ease-fluid hover:text-brand-700">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LangSwitch h={h} className="px-3.5 text-sm" />
          <TapLink
            href={whatsappHref}
            target="_blank"
            rel="noopener"
            className="group flex h-12 items-center gap-3 rounded-full bg-brand-500 ps-6 pe-1.5 text-[15px] font-semibold text-white transition-colors duration-500 ease-fluid hover:bg-brand-600 hover:text-white"
          >
            {h.book}
            <CtaIcon className="bg-white/20" />
          </TapLink>
        </div>
      </header>

      {/* Mobile: floating pill + full-screen glass menu */}
      <header className="sticky top-3 z-30 mx-3 mt-3 flex items-center justify-between gap-2 rounded-full bg-bg/80 py-2 ps-3 pe-2 shadow-md ring-1 ring-ink-900/5 backdrop-blur-xl lg:hidden">
        <a href={home} className="flex min-w-0 items-center gap-2">
          <Image src="/logo.webp" alt={h.logoAlt} width={41} height={40} className="h-9 w-auto" priority />
          <b className="font-heading text-sm leading-tight font-bold text-balance text-ink-900">{h.mobileName}</b>
        </a>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <LangSwitch h={h} className="px-2.5 text-[13px]" />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? h.menuClose : h.menuOpen}
            className="relative size-11 rounded-full bg-ink-900/5"
          >
            <i
              className={`absolute top-1/2 left-1/2 h-[1.5px] w-[18px] -translate-x-1/2 bg-ink-900 transition-transform duration-500 ease-fluid ${open ? "rotate-45" : "-translate-y-[4px]"}`}
            />
            <i
              className={`absolute top-1/2 left-1/2 h-[1.5px] w-[18px] -translate-x-1/2 bg-ink-900 transition-transform duration-500 ease-fluid ${open ? "-rotate-45" : "translate-y-[3px]"}`}
            />
          </button>
        </div>
      </header>
      <nav
        id="mobile-nav"
        inert={!open}
        className={`fixed inset-0 z-20 flex lg:hidden flex-col justify-center gap-2 bg-bg/85 px-8 backdrop-blur-3xl transition-opacity duration-500 ease-fluid ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        {h.nav.map((item, i) => (
          <span key={item.href} className="overflow-hidden">
            <a
              href={item.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${100 + i * 50}ms` : "0ms" }}
              className={`block py-2 font-heading text-[34px] font-bold text-ink-900 transition-[translate,opacity] duration-700 ease-fluid ${open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
            >
              {item.label}
            </a>
          </span>
        ))}
      </nav>
    </>
  );
}

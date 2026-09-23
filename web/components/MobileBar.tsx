"use client";

import { m } from "motion/react";
import { useEffect, useState } from "react";
import ar from "@/messages/ar.json";
import type { Messages } from "@/lib/i18n";
import { phoneHref, whatsappHref } from "@/lib/site";
import TapLink from "./motion/TapLink";
import { DURATION, EASE } from "./motion/tokens";
import { WhatsAppIcon } from "./ui";

/** Sticky WhatsApp + Call bar on mobile; slides up once the hero has scrolled out of view. */
export default function MobileBar({ t = ar }: { t?: Messages }) {
  const bar = t.mobileBar;
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <m.div
      initial={false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: DURATION.fast, ease: EASE }}
      inert={!shown}
      aria-hidden={!shown}
      className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 grid grid-cols-[1.4fr_1fr] gap-2 rounded-full bg-surface/85 p-1.5 shadow-lg ring-1 ring-ink-900/5 backdrop-blur-xl lg:hidden"
    >
      <TapLink
        href={whatsappHref}
        target="_blank"
        rel="noopener"
        className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-whatsapp text-base font-semibold text-white hover:text-white"
      >
        <WhatsAppIcon className="size-[18px]" />
        {bar.whatsapp}
      </TapLink>
      <TapLink
        href={phoneHref}
        className="flex h-[52px] items-center justify-center rounded-full bg-brand-100 text-base font-semibold text-brand-700"
      >
        {bar.call}
      </TapLink>
    </m.div>
  );
}

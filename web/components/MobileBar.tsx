"use client";

import { m } from "motion/react";
import { useEffect, useState } from "react";
import t from "@/messages/ar.json";
import { phoneHref, whatsappHref } from "@/lib/site";
import TapLink from "./motion/TapLink";
import { DURATION, EASE } from "./motion/tokens";
import { WhatsAppIcon } from "./ui";

const bar = t.mobileBar;

/** Sticky WhatsApp + Call bar on mobile; slides up once the hero has scrolled out of view. */
export default function MobileBar() {
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
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1.4fr_1fr] gap-2.5 border-t border-line bg-surface px-4 pt-3 pb-[max(18px,env(safe-area-inset-bottom))] lg:hidden"
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
        className="flex h-[52px] items-center justify-center rounded-full border-[1.5px] border-brand-500 text-base font-semibold text-brand-700"
      >
        {bar.call}
      </TapLink>
    </m.div>
  );
}

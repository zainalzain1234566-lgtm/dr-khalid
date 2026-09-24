"use client";

import Image from "next/image";
import { AnimatePresence, LazyMotion, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import ar from "@/messages/ar.json";
import type { Messages } from "@/lib/i18n";
import { MOTION_OK, gsap, useGSAP } from "./motion/gsap";
import Reveal from "./motion/Reveal";
import { DURATION, EASE } from "./motion/tokens";
import { Eyebrow, SectionTitle } from "./ui";

// Mobile shows every photo, in a full / half / half rhythm, uncropped: full-width tiles use the
// photo's own ratio (`w/h`); half tiles are 3:2 like the photos. `ar` = desktop tile shape; only
// those six appear in the desktop strip.
const PHOTOS = [
  { id: "17", w: 2048, h: 1365, ar: "4/3" },
  { id: "15", w: 2048, h: 1365, ar: "3/4" },
  { id: "11", w: 2048, h: 1365, ar: "4/3" },
  { id: "04", w: 2048, h: 1477 },
  { id: "12", w: 2048, h: 1365, ar: "1/1" },
  { id: "16", w: 2048, h: 1365, ar: "3/4" },
  { id: "07", w: 2048, h: 1248 },
  { id: "03", w: 2048, h: 1365, ar: "4/3" },
  { id: "05", w: 2048, h: 1365 },
  { id: "10", w: 2048, h: 1422 },
  { id: "08", w: 2048, h: 1365 },
  { id: "14", w: 2048, h: 1365 },
  { id: "13", w: 2048, h: 1473 },
  { id: "01", w: 1536, h: 1024 },
  { id: "06", w: 2048, h: 1365 },
].map((p) => ({ ...p, src: `/clinic/${p.id}.webp` }));

// layoutId needs the layout features, which aren't in the app-wide domAnimation bundle.
const loadLayoutFeatures = () => import("./motion/features-max").then((mod) => mod.default);
const transition = { duration: DURATION.base, ease: EASE };

export default function Gallery({ t = ar }: { t?: Messages }) {
  const g = t.gallery;
  const [openId, setOpenId] = useState<string | null>(null);
  const open = PHOTOS.find((p) => p.id === openId);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // Desktop: pin the section and slide the photo strip sideways as the viewer scrolls down.
  useGSAP(() => {
    gsap.matchMedia().add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
      const el = track.current!;
      el.dataset.h = "";
      const dir = document.documentElement.dir === "rtl" ? 1 : -1;
      const distance = () => el.scrollWidth - el.clientWidth;
      const shown = (el: HTMLElement) => [...el.children].filter((c) => (c as HTMLElement).offsetWidth).length;
      gsap.to(el, {
        x: () => dir * distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "center center",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.5,
          snap: () => 1 / Math.max(1, shown(el) - 1),
          invalidateOnRefresh: true,
        },
      });
      return () => delete el.dataset.h;
    });

    // Mobile: full-width tiles wipe in from the right, half tiles from the left, while each photo
    // settles from a slight zoom. The second half tile of each pair trails the first.
    gsap.matchMedia().add(`(max-width: 1023px) and ${MOTION_OK}`, () => {
      [...track.current!.children].forEach((tile, i) => {
        const tl = gsap.timeline({
          delay: i % 3 === 2 ? 0.12 : 0,
          scrollTrigger: { trigger: tile, start: "top 90%", once: true },
        });
        // inset(top right bottom left): 100% on the left side leaves only the right edge showing.
        const clipPath = i % 3 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";
        tl.from(tile, { clipPath, duration: 0.8, clearProps: "clipPath" }).from(
          tile.querySelector("img"),
          { scale: 1.2, duration: 1.1, clearProps: "transform" },
          0,
        );
      });
    });
  });

  useEffect(() => {
    if (!openId) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      opener.current?.focus();
    };
  }, [openId]);

  return (
    <LazyMotion features={loadLayoutFeatures}>
      <section ref={section} className="px-5 py-24 lg:px-8 lg:py-36">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:gap-12">
          <Reveal className="flex flex-col gap-2 lg:gap-3">
            <Eyebrow>{g.eyebrow}</Eyebrow>
            <SectionTitle>{g.title}</SectionTitle>
          </Reveal>
          <Reveal>
            <div
              ref={track}
              className="grid grid-cols-2 gap-2.5 lg:block lg:columns-4 lg:gap-4 data-h:flex data-h:h-[62vh] data-h:columns-auto data-h:will-change-transform"
            >
            {PHOTOS.map((p, i) => (
              <m.button
                key={p.id}
                type="button"
                layoutId={`photo-${p.id}`}
                transition={transition}
                onClick={(e) => {
                  opener.current = e.currentTarget;
                  setOpenId(p.id);
                }}
                aria-label={g.openLabel}
                className={`${i % 3 ? "" : "col-span-2"} ${p.ar ? "" : "lg:hidden"} block aspect-(--m) w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-xl focus-visible:ring-[3px] focus-visible:ring-brand-700 focus-visible:outline-none lg:mb-4 lg:aspect-(--ar) lg:rounded-[1.5rem] [[data-h]_&]:mb-0 [[data-h]_&]:h-full [[data-h]_&]:w-auto [[data-h]_&]:shrink-0`}
                style={{ "--ar": p.ar, "--m": i % 3 ? "3/2" : `${p.w}/${p.h}` } as React.CSSProperties}
              >
                <Image
                  src={p.src}
                  alt={g.photoAlt}
                  width={600}
                  height={600}
                  sizes={`(min-width: 1024px) 290px, ${i % 3 ? "50vw" : "100vw"}`}
                  className="size-full object-cover"
                />
              </m.button>
            ))}
            </div>
          </Reveal>
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <m.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={g.eyebrow}
            onClick={() => setOpenId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <m.div
              className="absolute inset-0 bg-ink-900/88"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
            />
            {/* Shares its layoutId with the thumbnail, so the thumbnail expands into place. */}
            <m.div
              layoutId={`photo-${open.id}`}
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              transition={transition}
              className="relative overflow-hidden rounded-[1.5rem]"
            >
              <Image
                src={open.src}
                alt={g.photoAlt}
                width={2048}
                height={1365}
                sizes="1100px"
                className="block h-auto max-h-[min(760px,85vh)] w-auto max-w-[min(1100px,92vw)]"
              />
            </m.div>
            <button
              ref={closeBtn}
              type="button"
              onClick={() => setOpenId(null)}
              className="absolute top-4 end-4 rounded-full bg-white/92 px-4 py-2 text-sm font-semibold text-ink-900"
            >
              {g.close}
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

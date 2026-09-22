"use client";

import Image from "next/image";
import { AnimatePresence, LazyMotion, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import t from "@/messages/ar.json";
import Reveal from "./motion/Reveal";
import { DURATION, EASE } from "./motion/tokens";
import { Eyebrow, SectionTitle } from "./ui";

const g = t.gallery;

const PHOTOS = [
  { id: "17", ar: "4/3" },
  { id: "15", ar: "3/4" },
  { id: "09", ar: "4/3" },
  { id: "12", ar: "1/1" },
  { id: "02", ar: "3/4" },
  { id: "03", ar: "4/3" },
  { id: "04", ar: "3/4" },
  { id: "05", ar: "1/1" },
  { id: "06", ar: "4/3" },
  { id: "07", ar: "3/4" },
].map((p) => ({ ...p, src: `/clinic/${p.id}.webp` }));

// layoutId needs the layout features, which aren't in the app-wide domAnimation bundle.
const loadLayoutFeatures = () => import("./motion/features-max").then((mod) => mod.default);
const transition = { duration: DURATION.base, ease: EASE };

export default function Gallery() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = PHOTOS.find((p) => p.id === openId);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

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
      <section className="px-5 py-16 lg:px-8 lg:py-28">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:gap-12">
          <Reveal className="flex flex-col gap-2 lg:gap-3">
            <Eyebrow>{g.eyebrow}</Eyebrow>
            <SectionTitle>{g.title}</SectionTitle>
          </Reveal>
          <Reveal className="columns-2 gap-2.5 lg:columns-4 lg:gap-4">
            {PHOTOS.map((p) => (
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
                className="mb-2.5 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-xl focus-visible:ring-[3px] focus-visible:ring-brand-700 focus-visible:outline-none lg:mb-4 lg:rounded-md"
                style={{ aspectRatio: p.ar }}
              >
                <Image
                  src={p.src}
                  alt={g.photoAlt}
                  width={600}
                  height={600}
                  sizes="(min-width: 1024px) 290px, 175px"
                  className="size-full object-cover"
                />
              </m.button>
            ))}
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
              className="relative overflow-hidden rounded-md"
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

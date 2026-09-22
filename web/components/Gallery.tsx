"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import t from "@/messages/ar.json";
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

export default function Gallery() {
  const [open, setOpen] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  return (
    <section className="px-5 py-16 lg:px-8 lg:py-28">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:gap-12">
        <div className="flex flex-col gap-2 lg:gap-3">
          <Eyebrow>{g.eyebrow}</Eyebrow>
          <SectionTitle>{g.title}</SectionTitle>
        </div>
        <div className="columns-2 gap-2.5 lg:columns-4 lg:gap-4">
          {PHOTOS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOpen(p.src)}
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
            </button>
          ))}
        </div>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={() => setOpen(null)}
        aria-label={g.eyebrow}
        className="m-auto max-h-none max-w-none bg-transparent p-4 backdrop:bg-ink-900/88"
      >
        {open && (
          <Image
            src={open}
            alt={g.photoAlt}
            width={2048}
            height={1365}
            sizes="1100px"
            className="h-auto max-h-[min(760px,85vh)] w-auto max-w-[min(1100px,92vw)] rounded-md"
          />
        )}
        <button type="button" className="sr-only focus:not-sr-only" onClick={() => setOpen(null)}>
          {g.close}
        </button>
      </dialog>
    </section>
  );
}

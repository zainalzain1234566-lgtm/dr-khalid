"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import TapLink from "@/components/motion/TapLink";
import Stagger, { StaggerItem } from "@/components/motion/Stagger";
import { WhatsAppIcon } from "@/components/ui";
import type { Case } from "@/lib/cases";
import { whatsappHref } from "@/lib/site";
import t from "@/messages/ar.json";

const ALL = "الكل";
const services = t.services.items.map((s) => s.t);
const c = t.cases;
const fill = (s: string, title: string) => s.replace("{title}", title);

const pill = (on: boolean) =>
  `flex-none h-11 rounded-full border-[1.5px] px-4 font-semibold flex items-center gap-2 ${on ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-surface text-ink-700"}`;
const round = "flex size-11 flex-none items-center justify-center rounded-full border-[1.5px] font-heading text-lg font-semibold";

const slider = (k: Case, aspect?: string, sizes?: string) => (
  <BeforeAfterSlider
    before={k.before}
    after={k.after}
    label={fill(c.sliderLabel, k.t)}
    beforeLabel={c.before}
    afterLabel={c.after}
    beforeAlt={fill(c.beforeAlt, k.t)}
    afterAlt={fill(c.afterAlt, k.t)}
    aspect={aspect}
    sizes={sizes}
  />
);

// Every service gets a chip (even with no cases yet), so service cards on the home page can deep-link here.
export default function CasesGrid({ cases, initial }: { cases: Case[]; initial?: string }) {
  const [chip, setChip] = useState(initial && services.includes(initial) ? initial : ALL);
  const chips = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [side, setSide] = useState(false);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const list = cases.filter((k) => chip === ALL || k.tag === chip);
  const featured = chip === ALL && list.length >= 3;
  const m = open == null ? null : list[open];
  const go = (d: number) => setOpen((i) => (i == null ? i : (i + d + list.length) % list.length));

  // Keep the URL shareable and scroll the active chip into view (the row scrolls sideways on mobile).
  useEffect(() => {
    const url = chip === ALL ? "/cases" : `/cases?t=${encodeURIComponent(chip)}`;
    window.history.replaceState(null, "", url);
    chips.current?.querySelector("[aria-pressed=true]")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [chip]);

  // Native <dialog> gives us Esc, focus trapping and the backdrop for free.
  useEffect(() => {
    const el = dialog.current!;
    if (m && !el.open) el.showModal();
    if (!m && el.open) el.close();
  }, [m]);

  return (
    <>
      <div className="sticky top-[73px] z-10 border-b border-line bg-bg/95 lg:top-0">
        <div ref={chips} role="group" aria-label="نوع العلاج" className="mx-auto flex max-w-[1200px] gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] lg:flex-wrap lg:px-8 lg:py-4">
          {[ALL, ...services].map((l) => (
            <button key={l} aria-pressed={chip === l} onClick={() => setChip(l)} className={pill(chip === l)}>
              {l}
              <span className="text-xs opacity-80">{l === ALL ? cases.length : cases.filter((k) => k.tag === l).length}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-[1200px] px-4 pt-5 pb-12 lg:px-8 lg:pt-10 lg:pb-20">
        {list.length ? (
          <Stagger key={chip} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {list.map((k, i) => {
              const big = featured && i === 0;
              return (
                <StaggerItem
                  key={k.before}
                  className={`flex flex-col overflow-hidden rounded-[16px] bg-surface shadow-[0_2px_8px_rgba(221,100,97,0.06)] ${big ? "lg:col-span-2 lg:grid lg:grid-cols-[1.4fr_1fr] lg:rounded-[28px] lg:border-2 lg:border-brand-100" : ""}`}
                >
                  {slider(k, "aspect-[4/3]", big ? "(min-width: 1024px) 640px, 100vw" : "(min-width: 1024px) 384px, 100vw")}
                  <button
                    onClick={() => { setSide(false); setOpen(i); }}
                    className={`flex flex-1 flex-col gap-3 text-right ${big ? "p-5 lg:justify-center lg:p-8" : "p-5"}`}
                  >
                    {big && <span className="hidden text-[13px] font-semibold text-brand-700 lg:block">حالة مميزة</span>}
                    <span className="self-start rounded-[8px] bg-brand-100 px-2.5 py-[3px] text-[13px] font-semibold text-brand-700">{k.tag}</span>
                    <h3 className={`font-heading leading-snug font-semibold text-ink-900 ${big ? "text-[17px] lg:text-2xl" : "text-[17px]"}`}>{k.t}</h3>
                    <span className="mt-auto border-t border-line pt-3 text-sm font-semibold text-brand-700">عرض التفاصيل ←</span>
                  </button>
                </StaggerItem>
              );
            })}
          </Stagger>
        ) : (
          <div className="flex flex-col items-center gap-4 px-5 py-16 text-center">
            <b className="font-heading text-xl font-semibold text-ink-900">لا توجد حالات لهذا العلاج حالياً</b>
            <span className="text-ink-500">جرّب علاجاً آخر.</span>
            <button onClick={() => setChip(ALL)} className="min-h-11 font-semibold text-brand-700 underline">عرض كل الحالات</button>
          </div>
        )}
      </section>

      <dialog
        ref={dialog}
        aria-label={m?.t}
        onClose={() => { setOpen(null); setZoom(null); }}
        onCancel={(e) => {
          // Esc closes the full-size photo first, then the case.
          if (zoom) { e.preventDefault(); setZoom(null); }
        }}
        onKeyDown={(e) => {
          // Arrow keys move between cases, unless the slider has focus (it uses them itself).
          if ((e.target as HTMLElement).role === "slider") return;
          if (e.key === "ArrowLeft") go(1);
          if (e.key === "ArrowRight") go(-1);
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-surface backdrop:bg-ink-900/60 lg:m-auto lg:h-auto lg:max-h-[880px] lg:max-w-[1200px] lg:rounded-[28px]"
      >
        {m && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:px-6 lg:py-4">
              <button onClick={() => setOpen(null)} aria-label="إغلاق" className={`${round} border-line text-ink-900`}>✕</button>
              <span className="text-sm text-ink-500">{open! + 1} / {list.length}</span>
              <div className="flex gap-2">
                <button onClick={() => go(-1)} aria-label="الحالة السابقة" className={`${round} border-line text-ink-900`}>→</button>
                <button onClick={() => go(1)} aria-label="الحالة التالية" className={`${round} border-brand-500 bg-brand-500 text-white`}>←</button>
              </div>
            </div>

            <div className="grid flex-1 content-start gap-5 overflow-y-auto p-4 lg:grid-cols-[1.4fr_1fr] lg:gap-10 lg:px-8 lg:py-7">
              <div className="flex flex-col gap-4">
                <div role="group" aria-label="طريقة العرض" className="flex gap-1 self-start rounded-full bg-brand-50 p-1">
                  {[["مقارنة", false], ["جنباً إلى جنب", true]].map(([l, v]) => (
                    <button
                      key={String(l)}
                      aria-pressed={side === v}
                      onClick={() => setSide(v as boolean)}
                      className={`h-10 rounded-full px-[18px] text-sm font-semibold ${side === v ? "bg-surface text-ink-900 shadow-[0_1px_4px_rgba(31,35,40,0.12)]" : "text-ink-500"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                {side ? (
                  <div dir="ltr" className="grid grid-cols-2 gap-2">
                    {([[m.before, c.before, c.beforeAlt], [m.after, c.after, c.afterAlt]] as const).map(([src, l, alt]) => (
                      <button
                        key={l}
                        onClick={() => setZoom({ src, alt: fill(alt, m.t) })}
                        aria-label={`تكبير صورة ${l}`}
                        className="relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-[16px] bg-line"
                      >
                        <Image src={src} alt={fill(alt, m.t)} fill sizes="(min-width: 1024px) 330px, 50vw" className="object-cover" />
                        <span className="absolute top-3 right-3 rounded-full bg-white/92 px-3 py-1 text-[13px] font-semibold text-ink-900">{l}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div key={m.before} className="overflow-hidden rounded-[16px]">
                    {slider(m, "aspect-[4/3]", "(min-width: 1024px) 680px, 100vw")}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <span className="self-start rounded-[8px] bg-brand-100 px-2.5 py-[3px] text-[13px] font-semibold text-brand-700">{m.tag}</span>
                <h2 className="font-heading text-[22px] leading-snug font-bold text-ink-900 lg:text-[30px]">{m.t}</h2>
                <p className="leading-relaxed text-ink-700">صور حقيقية من عيادتنا، بموافقة المريض.</p>
                <div className="mt-auto flex flex-col gap-2.5 pt-2">
                  <TapLink href="/book" className="flex h-[52px] items-center justify-center rounded-full bg-brand-500 px-8 font-semibold text-white hover:bg-brand-600 hover:text-white">
                    احجز استشارة لحالة مشابهة
                  </TapLink>
                  <TapLink
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener"
                    className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-whatsapp px-7 font-semibold text-white hover:text-white"
                  >
                    <WhatsAppIcon className="size-5" />
                    اسأل عبر واتساب
                  </TapLink>
                </div>
              </div>
            </div>
          </div>
        )}
        {zoom && (
          <div onClick={() => setZoom(null)} className="fixed inset-0 z-10 flex items-center justify-center bg-ink-900/92 p-4">
            <Image src={zoom.src} alt={zoom.alt} width={2048} height={1536} sizes="100vw" className="h-auto max-h-[90dvh] w-auto max-w-full rounded-[16px] object-contain" />
            <button onClick={() => setZoom(null)} aria-label="إغلاق" className={`${round} absolute top-4 left-4 border-white/30 bg-white/92 text-ink-900`}>✕</button>
          </div>
        )}
      </dialog>
    </>
  );
}

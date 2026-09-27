"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION_OK, gsap, useGSAP } from "@/components/motion/gsap";
import type { Certificate } from "@/lib/certificates";

type Doctor = { slug: string; name: string; role: string; img: string; certs: Certificate[] };

const TITLE = "تعلّم مستمر، موثّق بالشهادات";
const arrow = "flex size-11 flex-none items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-500";

function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" className={`size-5 ${flip ? "-scale-x-100" : ""}`}>
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CertificatesGallery({ doctors, initial }: { doctors: Doctor[]; initial: string }) {
  const [slug, setSlug] = useState(initial);
  const [open, setOpen] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const doc = doctors.find((d) => d.slug === slug)!;
  const cert = doc.certs[open];
  const total = doctors.reduce((n, d) => n + d.certs.length, 0);
  const since = Math.min(...doctors.flatMap((d) => d.certs.filter((c) => c.year).map((c) => +c.year)));

  // Page intro: title words rise, then the rest settles in; doctor cards lift off the hero.
  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap
          .timeline({ delay: 0.1 })
          .from("[data-word]", { yPercent: 110, duration: 0.9, stagger: 0.08, ease: "power4.out" })
          .from("[data-fade]", { y: 24, opacity: 0, stagger: 0.08 }, "-=0.6")
          .from("[data-num]", { textContent: 0, snap: { textContent: 1 }, duration: 1.2, ease: "power2.out" }, "<")
          .from("[data-doc]", { y: 60, opacity: 0, stagger: 0.1, duration: 0.8 }, "-=1");
      });
    },
    { scope: root },
  );

  // Each doctor switch (and first load): the wall rebuilds, frames dropping in as they scroll into view.
  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        gsap.from("[data-doc-head] > *", { y: 20, opacity: 0, stagger: 0.06 });
        gsap.set(cards, { opacity: 0, y: 70, rotate: (i) => (i % 2 ? 2.5 : -2.5), scale: 0.94 });
        ScrollTrigger.batch(cards, {
          start: "top 92%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, rotate: 0, scale: 1, duration: 0.9, stagger: 0.09, ease: "power3.out" }),
        });
        ScrollTrigger.refresh();
      });
    },
    { scope: grid, dependencies: [slug], revertOnUpdate: true },
  );

  // Lightbox: frame zooms up from the grid, and slides between certificates.
  useGSAP(
    () => {
      if (open < 0) return;
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.fromTo("[data-lb-img]", { opacity: 0, scale: 0.92, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5 });
        gsap.fromTo("[data-lb-cap]", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.1 });
      });
    },
    { scope: dialog, dependencies: [open, slug] },
  );

  const pick = (s: string) => {
    if (s === slug) return;
    setSlug(s);
    history.replaceState(null, "", `?d=${s}`);
    const top = grid.current!.getBoundingClientRect().top + scrollY - 120;
    if (scrollY > top) scrollTo({ top, behavior: "smooth" });
  };
  const show = (i: number) => {
    setOpen(i);
    dialog.current?.showModal();
  };
  const step = (d: number) => setOpen((i) => (i + d + doc.certs.length) % doc.certs.length);

  return (
    <div ref={root}>
      <section className="relative overflow-hidden -mt-[72px] bg-deep px-5 pt-[92px] pb-32 text-white lg:-mt-[84px] lg:px-8 lg:pt-[108px] lg:pb-44">
        <div aria-hidden className="pointer-events-none absolute -top-48 end-[10%] size-[560px] rounded-full bg-brand-500/25 blur-[130px]" />
        <div className="relative mx-auto flex max-w-[1200px] flex-col gap-10 lg:gap-14">
          <nav aria-label="مسار التنقل" data-fade className="flex gap-2 text-sm text-deep-muted">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <span>←</span>
            <Link href="/#doctors" className="hover:text-white">أطباؤنا</Link>
            <span>←</span>
            <span className="font-semibold text-white">الشهادات</span>
          </nav>
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="flex flex-col gap-4">
              <span data-fade className="w-max rounded-full bg-white/8 px-3 py-1 text-xs font-semibold tracking-wide text-brand-100 ring-1 ring-white/12">
                شهادات الأطباء
              </span>
              <h1 className="font-heading text-[34px] leading-[1.2] font-bold text-balance lg:text-[56px] lg:leading-[1.1]">
                {TITLE.split(" ").map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="inline-block overflow-hidden pb-1 align-bottom">
                      <span data-word className="inline-block">{w}</span>
                    </span>
                  </Fragment>
                ))}
              </h1>
              <p data-fade className="max-w-[560px] leading-[1.7] text-deep-muted lg:text-[17px]">
                مؤتمرات ودورات تخصصية داخل العراق وخارجه. اختر الطبيب، واضغط على أي شهادة لعرضها بالحجم الكامل.
              </p>
            </div>
            <dl className="grid grid-cols-3 divide-x divide-white/12 rounded-md bg-white/5 ring-1 ring-white/10 rtl:divide-x-reverse">
              {[
                { n: total, l: "شهادة", count: true },
                { n: doctors.length, l: "أطباء", count: true },
                { n: since, l: "تعلّم مستمر منذ", count: false },
              ].map((s) => (
                <div key={s.l} data-fade className="flex flex-col gap-1 px-4 py-3 lg:px-6 lg:py-4">
                  <dt className="order-2 text-xs text-deep-muted">{s.l}</dt>
                  <dd {...(s.count && { "data-num": "" })} className="font-heading text-[26px] leading-none font-bold lg:text-[34px]">
                    {s.n}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div role="tablist" aria-label="الطبيب" className="relative mx-auto -mt-20 grid max-w-[1200px] grid-cols-3 gap-2.5 px-4 lg:-mt-28 lg:gap-6 lg:px-8">
        {doctors.map((d) => {
          const on = d.slug === slug;
          return (
            <button
              key={d.slug}
              data-doc
              role="tab"
              aria-selected={on}
              onClick={() => pick(d.slug)}
              className={`group relative flex flex-col items-center gap-2 overflow-hidden rounded-lg bg-surface px-2 pt-3 pb-3 text-center shadow-md transition-[translate,box-shadow] duration-500 lg:flex-row lg:gap-5 lg:p-5 lg:text-start ${on ? "ring-2 ring-brand-500 lg:-translate-y-1.5" : "ring-1 ring-line hover:-translate-y-1"}`}
            >
              <span className="relative size-16 flex-none overflow-hidden rounded-full bg-brand-100 lg:size-24">
                <Image src={d.img} alt="" fill sizes="96px" className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <b className="font-heading text-[13px] leading-snug font-semibold text-ink-900 lg:text-lg">{d.name}</b>
                <span className="hidden text-sm text-ink-500 lg:block">{d.role}</span>
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors lg:absolute lg:top-4 lg:end-4 ${on ? "bg-brand-500 text-white" : "bg-brand-100 text-brand-700"}`}
              >
                {d.certs.length} شهادات
              </span>
            </button>
          );
        })}
      </div>

      <section ref={grid} className="px-4 pt-12 pb-16 lg:px-8 lg:pt-20 lg:pb-28">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 lg:gap-12">
          <div data-doc-head key={slug} className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-brand-700">{doc.role}</span>
            <h2 className="font-heading text-[24px] font-bold text-ink-900 lg:text-[34px]">شهادات {doc.name}</h2>
          </div>

          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 lg:gap-7">
            {doc.certs.map((c, i) => (
              <button
                key={c.src}
                data-card
                onClick={() => show(i)}
                className="group mb-5 block w-full break-inside-avoid rounded-lg bg-surface p-3 text-start shadow-sm ring-1 ring-line transition-shadow duration-500 hover:shadow-lg lg:mb-7"
              >
                <span className="relative block overflow-hidden rounded-md bg-brand-50">
                  <Image
                    src={c.src}
                    placeholder="blur"
                    blurDataURL={c.blur}
                    alt={c.title}
                    width={c.w}
                    height={c.h}
                    sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw"
                    className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-deep/0 transition-colors duration-500 group-hover:bg-deep/35">
                    <span className="flex size-12 scale-75 items-center justify-center rounded-full bg-white text-deep opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                      <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5M11 8v6M8 11h6" strokeLinecap="round" />
                      </svg>
                    </span>
                  </span>
                </span>
                <span className="flex flex-col gap-1 px-1.5 pt-4 pb-1.5">
                  <b className="font-heading text-[15px] leading-snug font-semibold text-ink-900">{c.title}</b>
                  <span className="flex items-center gap-2 text-[13px] text-ink-500">
                    {c.issuer}
                    {c.year && <span className="rounded-full bg-brand-100 px-2 py-px text-xs font-semibold text-brand-700">{c.year}</span>}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <dialog
        ref={dialog}
        onClose={() => setOpen(-1)}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") step(1);
          if (e.key === "ArrowRight") step(-1);
        }}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-transparent p-4 backdrop:bg-[rgb(23_42_58/0.92)] backdrop:backdrop-blur-sm"
      >
        {cert && (
          <figure className="mx-auto flex h-full max-w-[1100px] flex-col items-center justify-center gap-5" onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}>
            <Image
              key={cert.src}
              data-lb-img
              src={cert.src}
              placeholder="blur"
              blurDataURL={cert.blur}
              alt={cert.title}
              width={cert.w}
              height={cert.h}
              sizes="90vw"
              className="max-h-[72vh] w-auto rounded-md object-contain shadow-[0_40px_80px_-20px_rgb(0_0_0/0.7)]"
            />
            <figcaption data-lb-cap key={`${cert.src}-cap`} className="flex w-full max-w-[720px] items-center gap-3 text-white">
              <button aria-label="السابق" onClick={() => step(-1)} className={arrow}>
                <Chevron />
              </button>
              <span className="flex flex-1 flex-col gap-1 text-center">
                <b className="font-heading font-semibold">{cert.title}</b>
                <span className="text-sm text-white/70">
                  {cert.issuer}
                  {cert.year && ` · ${cert.year}`}
                </span>
                <span className="font-heading text-xs text-white/50 tabular-nums">
                  {open + 1} / {doc.certs.length}
                </span>
              </span>
              <button aria-label="التالي" onClick={() => step(1)} className={arrow}>
                <Chevron flip />
              </button>
            </figcaption>
            <button
              onClick={() => dialog.current?.close()}
              className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-deep"
            >
              إغلاق
            </button>
          </figure>
        )}
      </dialog>
    </div>
  );
}

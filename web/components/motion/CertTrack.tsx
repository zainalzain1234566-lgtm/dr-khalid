"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useRef } from "react";
import type { Certificate } from "@/lib/certificates";
import type { Messages } from "@/lib/i18n";
import { CtaIcon } from "../ui";
import { MOTION_OK, gsap, onceInView, useGSAP } from "./gsap";

type Item = Certificate & { doctor: string; slug: string };
type Props = { items: Item[]; c: Messages["certificates"]; doctors: number; since: number };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Navy "wall of honour". Desktop: the section pins and the framed certificates travel
 * sideways with the scroll, each one swinging level as it arrives; a coral bar and counter
 * track progress. Mobile: native swipe row with the same bar, frames rise in once.
 * Static under reduced motion.
 */
export default function CertTrack({ items, c, doctors, since }: Props) {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  const setProgress = (p: number) => {
    bar.current!.style.transform = `scaleX(${Math.max(0.04, p)})`;
    count.current!.textContent = pad(Math.round(p * (items.length - 1)) + 1);
  };

  useGSAP(
    () => {
      const el = root.current!;
      const track = el.querySelector<HTMLElement>("[data-track]")!;
      const cards = gsap.utils.toArray<HTMLElement>("[data-cert]", el);
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ scrollTrigger: onceInView(el) });
        tl.from("[data-word]", { yPercent: 110, duration: 0.8, stagger: 0.07, ease: "power4.out" })
          .from("[data-fade]", { y: 24, opacity: 0, stagger: 0.08 }, "-=0.5")
          .from("[data-num]", { textContent: 0, snap: { textContent: 1 }, duration: 1.2, ease: "power2.out" }, "<");
      });

      mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        const rtl = document.documentElement.dir === "rtl";
        const dist = () => track.scrollWidth - track.clientWidth;
        const move = gsap.to(track, {
          x: () => (rtl ? dist() : -dist()),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${dist() * 1.1}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (s) => setProgress(s.progress),
          },
        });
        cards.forEach((card, i) =>
          gsap.from(card, {
            rotate: i % 2 ? 6 : -6,
            yPercent: i % 2 ? 14 : -10,
            scale: 0.82,
            opacity: 0,
            ease: "power2.out",
            transformOrigin: "50% 0%",
            scrollTrigger: {
              trigger: card,
              containerAnimation: move,
              start: rtl ? "right left" : "left right",
              end: rtl ? "right 35%" : "left 65%",
              horizontal: true,
              scrub: true,
            },
          }),
        );
      });

      mm.add(`(max-width: 1023px) and ${MOTION_OK}`, () => {
        gsap.from(cards.slice(0, 3), {
          x: document.documentElement.dir === "rtl" ? -80 : 80,
          rotate: -4,
          opacity: 0,
          stagger: 0.12,
          duration: 0.9,
          scrollTrigger: { trigger: track, start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  const stats = [
    { n: items.length, label: c.statCerts },
    { n: doctors, label: c.statDoctors },
    { n: since, label: c.statSince, still: true },
  ];

  return (
    <section ref={root} id="certificates" className="relative overflow-hidden bg-deep text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 start-1/4 size-[520px] rounded-full bg-brand-500/20 blur-[120px]" />
      <div className="relative flex flex-col justify-center gap-10 py-20 lg:h-svh lg:gap-[clamp(1.5rem,4vh,3rem)] lg:pt-24 lg:pb-8">
        <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-5 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
          <div className="flex flex-col gap-4">
            <span data-fade className="w-max rounded-full bg-white/8 px-3 py-1 text-xs font-semibold tracking-wide text-brand-100 ring-1 ring-white/12">
              {c.eyebrow}
            </span>
            <h2 className="font-heading text-[32px] leading-[1.2] font-bold text-balance lg:text-[clamp(34px,5.5vh,52px)] lg:leading-[1.1]">
              {c.title.split(" ").map((w, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span className="inline-block overflow-hidden pb-1 align-bottom">
                    <span data-word className="inline-block">{w}</span>
                  </span>
                </Fragment>
              ))}
            </h2>
            <p data-fade className="max-w-[520px] leading-[1.7] text-deep-muted lg:text-[17px]">
              {c.body.replace("{n}", String(items.length))}
            </p>
          </div>
          <div className="flex flex-col gap-6 lg:items-end">
            <dl className="grid grid-cols-3 divide-x divide-white/12 rounded-md bg-white/5 ring-1 ring-white/10 rtl:divide-x-reverse">
              {stats.map((s) => (
                <div key={s.label} data-fade className="flex flex-col gap-1 px-4 py-3 lg:px-6 lg:py-4">
                  <dt className="order-2 text-xs text-deep-muted">{s.label}</dt>
                  <dd {...(!s.still && { "data-num": "" })} className="font-heading text-[26px] leading-none font-bold text-white lg:text-[34px]">
                    {s.n}
                  </dd>
                </div>
              ))}
            </dl>
            <Link
              data-fade
              href="/certificates"
              className="group hidden h-[52px] w-max items-center lg:flex gap-3 rounded-full bg-brand-500 ps-6 pe-2 font-semibold text-white transition-colors hover:bg-white hover:text-deep"
            >
              {c.cta}
              <CtaIcon className="bg-black/15" />
            </Link>
          </div>
        </div>

        <ul
          data-track
          onScroll={(e) => {
            const t = e.currentTarget;
            setProgress(Math.abs(t.scrollLeft) / (t.scrollWidth - t.clientWidth || 1));
          }}
          className="flex snap-x snap-mandatory items-start gap-5 overflow-x-auto px-5 py-4 [scrollbar-width:none] lg:snap-none lg:gap-12 lg:overflow-visible lg:px-[max(2rem,calc((100vw-1200px)/2))]"
        >
          {items.map((it) => (
            <li key={it.src} data-cert className="flex-none snap-center">
              <Link href={`/certificates?d=${it.slug}`} className="group flex w-max flex-col gap-4">
                <Image
                  src={it.src}
                  placeholder="blur"
                  blurDataURL={it.blur}
                  alt={it.title}
                  width={it.w}
                  height={it.h}
                  sizes="(min-width: 1024px) 560px, 80vw"
                  className="h-[250px] w-auto max-w-[82vw] rounded-sm object-contain shadow-[0_30px_60px_-18px_rgb(0_0_0/0.7)] transition-transform duration-500 ease-out group-hover:-translate-y-2 lg:h-[min(34vh,400px)] lg:max-w-none"
                />
                <span className="flex w-0 min-w-full flex-col gap-1">
                  <span className="flex items-center gap-2 text-xs font-semibold text-brand-100">
                    <i className="size-1.5 rounded-full bg-brand-500" />
                    {it.doctor}
                    {it.year && <span className="text-deep-faint">· {it.year}</span>}
                  </span>
                  <b className="line-clamp-2 font-heading text-[15px] leading-snug font-semibold text-white">{it.title}</b>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mx-auto flex w-full max-w-[1200px] items-center gap-4 px-5 text-sm text-deep-muted lg:px-8">
          <span className="font-heading tabular-nums">
            <span ref={count} className="text-white">01</span> / {pad(items.length)}
          </span>
          <span className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/12">
            <span ref={bar} style={{ transform: "scaleX(0.04)" }} className="block h-full origin-left rounded-full bg-brand-500 rtl:origin-right" />
          </span>
          <span className="lg:hidden">{c.swipe}</span>
        </div>
        <Link
          href="/certificates"
          className="group mx-5 flex h-[52px] items-center justify-between gap-3 rounded-full bg-brand-500 ps-6 pe-2 font-semibold text-white lg:hidden"
        >
          {c.cta}
          <CtaIcon className="bg-black/15" />
        </Link>
      </div>
    </section>
  );
}

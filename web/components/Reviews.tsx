import t from "@/messages/ar.json";
import CountUp from "./motion/CountUp";
import Reveal from "./motion/Reveal";
import Stagger, { StaggerItem } from "./motion/Stagger";
import TapLink from "./motion/TapLink";
import { Eyebrow, Stars } from "./ui";

const r = t.reviews;

function Actions({ className }: { className: string }) {
  const base = "flex h-[52px] items-center justify-center rounded-full font-semibold lg:px-6 lg:text-base";
  return (
    <div className={className}>
      <TapLink href="/review" className={`${base} bg-brand-500 text-white hover:bg-brand-600 hover:text-white`}>
        {r.write}
      </TapLink>
      <TapLink href="#reviews" className={`${base} border-[1.5px] border-brand-500 text-brand-700`}>
        {r.seeAll}
      </TapLink>
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="bg-brand-50 px-5 py-16 lg:px-8 lg:py-28">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 lg:grid lg:grid-cols-[320px_1fr] lg:gap-12">
        <Reveal className="flex flex-col gap-5 lg:gap-4">
          <Eyebrow>{r.eyebrow}</Eyebrow>
          {/* Desktop summary */}
          <div dir="ltr" className="hidden text-right font-heading text-7xl leading-none font-bold text-ink-900 lg:block">
            <CountUp value={Number(r.average)} decimals={1} />
          </div>
          <Stars label={r.starsLabel} className="hidden text-right text-[22px] tracking-[2px] lg:block" />
          <span className="hidden text-sm text-ink-500 lg:block">{r.countLabel}</span>
          <Actions className="mt-3 hidden gap-3 lg:flex" />
          {/* Mobile summary */}
          <div dir="ltr" className="flex items-center justify-end gap-3.5 lg:hidden">
            <Stars label={r.starsLabel} className="text-lg" />
            <b className="font-heading text-[44px] font-bold text-ink-900">
              <CountUp value={Number(r.average)} decimals={1} />
            </b>
          </div>
        </Reveal>

        <Stagger className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {r.items.map((item) => (
            <StaggerItem
              key={item.n}
              className="flex flex-col gap-2.5 rounded-md bg-surface p-[18px] lg:gap-3.5 lg:p-6 lg:shadow-sm"
            >
              <div className="flex justify-between">
                <Stars label={r.starsLabel} className="lg:tracking-[2px]" />
                <span className="hidden font-mono text-[11px] font-medium text-ink-500 lg:inline">{r.sample}</span>
              </div>
              <p className="flex-1 text-[15px] leading-[1.7] text-ink-700 lg:text-base">{item.q}</p>
              <div className="flex items-center justify-between lg:border-t lg:border-line lg:pt-3.5">
                <b className="font-semibold text-ink-900">{item.n}</b>
                <span className="rounded-sm bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 lg:px-2.5 lg:py-[3px] lg:text-[13px]">
                  {item.tag}
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Actions className="grid grid-cols-2 gap-2.5 lg:hidden" />
      </div>
    </section>
  );
}

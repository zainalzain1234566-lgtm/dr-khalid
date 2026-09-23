import { ar, isAr, type Messages } from "@/lib/i18n";
import { allCases } from "@/lib/cases";
import Reveal from "./motion/Reveal";
import Stagger, { StaggerItem } from "./motion/Stagger";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { Eyebrow, SectionTitle } from "./ui";

const fill = (s: string, title: string) => s.replace("{title}", title);

export default async function Cases({ t = ar }: { t?: Messages }) {
  const c = t.cases;
  const items = await allCases(t);
  return (
    <section id="cases" className="px-5 py-24 lg:px-8 lg:py-36">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:gap-12">
        <Reveal className="flex items-end justify-between">
          <div className="flex flex-col gap-2 lg:gap-3">
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <SectionTitle>{c.title}</SectionTitle>
          </div>
          <a href={isAr(t) ? "/cases" : "/en#cases"} className="hidden text-base font-semibold lg:inline">
            {c.seeAll}
          </a>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.t} className="flex flex-col gap-2.5 lg:gap-3.5">
              <div className="bezel [--r:1.75rem]">
                <div className="bezel-core overflow-hidden">
                <BeforeAfterSlider
                before={item.before}
                after={item.after}
                label={fill(c.sliderLabel, item.t)}
                beforeLabel={c.before}
                afterLabel={c.after}
                beforeAlt={fill(c.beforeAlt, item.t)}
                afterAlt={fill(c.afterAlt, item.t)}
                />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <b className="font-heading text-[17px] font-semibold text-ink-900 lg:text-[19px]">{item.t}</b>
                <span className="rounded-full bg-brand-100 px-3 py-[3px] text-xs font-semibold text-brand-700 lg:py-1 lg:text-[13px]">
                  {item.tag}
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <a href={isAr(t) ? "/cases" : "/en#cases"} className="flex min-h-11 items-center self-center font-semibold lg:hidden">
          {c.seeAll}
        </a>
      </div>
    </section>
  );
}

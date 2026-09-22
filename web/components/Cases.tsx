import t from "@/messages/ar.json";
import Reveal from "./motion/Reveal";
import Stagger, { StaggerItem } from "./motion/Stagger";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { Eyebrow, SectionTitle } from "./ui";

const c = t.cases;
const fill = (s: string, title: string) => s.replace("{title}", title);

export default function Cases() {
  return (
    <section id="cases" className="px-5 py-16 lg:px-8 lg:py-28">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:gap-12">
        <Reveal className="flex items-end justify-between">
          <div className="flex flex-col gap-2 lg:gap-3">
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <SectionTitle>{c.title}</SectionTitle>
          </div>
          {/* TODO: point to /cases once that page exists. */}
          <a href="#cases" className="hidden text-base font-semibold lg:inline">
            {c.seeAll}
          </a>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {c.items.map((item) => (
            <StaggerItem key={item.t} className="flex flex-col gap-2.5 lg:gap-3.5">
              <BeforeAfterSlider
                before={item.before}
                after={item.after}
                label={fill(c.sliderLabel, item.t)}
                beforeLabel={c.before}
                afterLabel={c.after}
                beforeAlt={fill(c.beforeAlt, item.t)}
                afterAlt={fill(c.afterAlt, item.t)}
              />
              <div className="flex items-center justify-between">
                <b className="font-heading text-[17px] font-semibold text-ink-900 lg:text-[19px]">{item.t}</b>
                <span className="rounded-sm bg-brand-100 px-2.5 py-[3px] text-xs font-semibold text-brand-700 lg:py-1 lg:text-[13px]">
                  {item.tag}
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <a href="#cases" className="self-center font-semibold lg:hidden">
          {c.seeAll}
        </a>
      </div>
    </section>
  );
}

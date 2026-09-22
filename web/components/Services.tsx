import t from "@/messages/ar.json";
import Reveal from "./motion/Reveal";
import Stagger, { StaggerItem } from "./motion/Stagger";
import { Eyebrow, SectionTitle } from "./ui";

const s = t.services;

export default function Services() {
  return (
    <section id="services" className="bg-brand-50 px-5 py-16 lg:px-8 lg:py-28">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:gap-12">
        <Reveal className="flex items-end justify-between gap-8">
          <div className="flex flex-col gap-2 lg:gap-3">
            <Eyebrow>{s.eyebrow}</Eyebrow>
            <SectionTitle>{s.title}</SectionTitle>
          </div>
          <p className="hidden max-w-[420px] text-[17px] leading-[1.7] text-ink-500 lg:block">{s.intro}</p>
        </Reveal>
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {s.items.map((item) => (
            <StaggerItem
              key={item.n}
              whileHover={{ y: -4 }}
              className="flex flex-col gap-2.5 rounded-md bg-surface p-4 transition-shadow duration-300 lg:gap-4 lg:p-7 lg:shadow-sm lg:hover:shadow-md"
            >
              <span
                dir="ltr"
                className="flex size-11 items-center justify-center rounded-full bg-brand-100 font-heading text-sm font-bold text-brand-500 lg:size-14 lg:text-base"
              >
                {item.n}
              </span>
              <h3 className="font-heading text-base leading-[1.35] font-semibold text-ink-900 lg:text-[21px]">{item.t}</h3>
              <p className="text-[13px] leading-[1.6] text-ink-500 lg:text-[15px] lg:leading-[1.7]">{item.d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

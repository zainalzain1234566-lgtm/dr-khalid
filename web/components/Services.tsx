import { ar, type Messages } from "@/lib/i18n";
import PinSteps from "./motion/PinSteps";
import Reveal from "./motion/Reveal";
import Stagger, { StaggerItem } from "./motion/Stagger";
import { SectionTitle } from "./ui";

export default function Services({ t = ar }: { t?: Messages }) {
  const s = t.services;
  return (
    <PinSteps id="services" className="bg-brand-50 px-5 py-16 lg:px-8 lg:py-28">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 lg:gap-12">
        <Reveal className="flex flex-col gap-3">
          <SectionTitle>{s.title}</SectionTitle>
          <p className="hidden max-w-[65ch] text-[17px] leading-[1.7] text-ink-500 lg:block">{s.intro}</p>
        </Reveal>
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-5">
          {s.items.map((item) => (
            <StaggerItem
              key={item.n}
              className="flex flex-col gap-2.5 rounded-md bg-surface p-4 transition-[box-shadow,translate] duration-300 hover:-translate-y-1 lg:gap-4 lg:p-7 lg:shadow-sm lg:hover:shadow-md"
            >
              <span
                data-step-badge
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
    </PinSteps>
  );
}

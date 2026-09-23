import Image from "next/image";
import { ar, type Messages } from "@/lib/i18n";
import ClipReveal from "./motion/ClipReveal";
import ScrubPhoto from "./motion/ScrubPhoto";
import Reveal from "./motion/Reveal";
import Stagger, { StaggerItem } from "./motion/Stagger";

function LabPhoto({ alt, className }: { alt: string; className: string }) {
  return (
    <ClipReveal className={`relative overflow-hidden rounded-[1.5rem] ${className}`}>
      <Image src="/clinic/06.webp" alt={alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
    </ClipReveal>
  );
}

function Benefit({ b }: { b: Messages["lab"]["benefits"][number] }) {
  return (
    <StaggerItem className="flex items-start gap-3.5 border-b border-white/12 py-3.5 lg:gap-5 lg:py-[22px]">
      <span className="flex size-10 flex-none items-center justify-center rounded-full border-[1.5px] border-brand-500 font-heading text-sm font-semibold text-brand-500 lg:size-11 lg:text-[15px]">
        {b.n}
      </span>
      <div className="flex flex-col gap-0.5 lg:gap-1">
        <b className="font-heading text-[17px] font-semibold text-white lg:text-xl">{b.t}</b>
        <span className="text-sm leading-[1.6] text-deep-muted lg:text-base">{b.d}</span>
      </div>
    </StaggerItem>
  );
}

export default function Lab({ t = ar }: { t?: Messages }) {
  const l = t.lab;
  return (
    <section id="lab" className="bg-deep px-5 py-24 text-white lg:px-8 lg:py-36">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-center lg:gap-[72px]">
        <div className="flex flex-col gap-5 lg:gap-7">
          <Reveal className="flex flex-col gap-5 lg:gap-7">
            <div className="flex items-center gap-2.5 lg:gap-3">
              <Image src="/logo.webp" alt="" width={37} height={36} className="logo-white h-7 w-auto lg:h-9" />
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold tracking-wide text-brand-100 ring-1 ring-white/12">{l.eyebrow}</span>
            </div>
            <h2 className="font-heading text-[28px] leading-[1.25] font-bold text-balance text-white lg:text-[44px] lg:leading-[1.2]">
              <span className="lg:hidden">{l.titleShort}</span>
              <span className="hidden lg:inline">{l.title}</span>
            </h2>
            <p className="max-w-[520px] text-base leading-[1.7] text-deep-muted lg:text-[17px]">
              <span className="lg:hidden">{l.bodyShort}</span>
              <span className="hidden lg:inline">{l.body}</span>
            </p>
          </Reveal>
          <LabPhoto alt={l.photoAlt} className="h-60 lg:hidden" />
          <Stagger className="flex flex-col gap-5 lg:gap-0 lg:border-t lg:border-white/12">
            {l.benefits.map((b) => (
              <Benefit key={b.n} b={b} />
            ))}
          </Stagger>
        </div>
        <div className="bezel bezel-dark hidden [--pad:0.5rem] [--r:2.25rem] lg:block">
          <ScrubPhoto src="/clinic/06.webp" alt={l.photoAlt} className="bezel-core h-[600px]" />
        </div>
      </div>
    </section>
  );
}

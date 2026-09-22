import Image from "next/image";
import t from "@/messages/ar.json";

const l = t.lab;

function LabPhoto({ className }: { className: string }) {
  // TODO(clinic): swap for the real lab photo once supplied.
  return (
    <div
      dir="ltr"
      className={`placeholder-stripes-deep flex items-center justify-center rounded-lg font-mono font-medium text-deep-faint ${className}`}
    >
      {l.photoPlaceholder}
    </div>
  );
}

function Benefit({ b }: { b: (typeof l.benefits)[number] }) {
  return (
    <div className="flex items-start gap-3.5 border-b border-white/12 py-3.5 lg:gap-5 lg:py-[22px]">
      <span className="flex size-10 flex-none items-center justify-center rounded-full border-[1.5px] border-brand-500 font-heading text-sm font-semibold text-brand-500 lg:size-11 lg:text-[15px]">
        {b.n}
      </span>
      <div className="flex flex-col gap-0.5 lg:gap-1">
        <b className="font-heading text-[17px] font-semibold text-white lg:text-xl">{b.t}</b>
        <span className="text-sm leading-[1.6] text-deep-muted lg:text-base">{b.d}</span>
      </div>
    </div>
  );
}

export default function Lab() {
  return (
    <section id="lab" className="bg-deep px-5 py-16 text-white lg:px-8 lg:py-28">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-center lg:gap-[72px]">
        <div className="flex flex-col gap-5 lg:gap-7">
          <div className="flex items-center gap-2.5 lg:gap-3">
            <Image src="/logo.webp" alt="" width={37} height={36} className="logo-white h-7 w-auto lg:h-9" />
            <span className="text-sm font-semibold text-brand-100 lg:text-[15px]">{l.eyebrow}</span>
          </div>
          <h2 className="font-heading text-[28px] leading-[1.25] font-bold text-balance text-white lg:text-[44px] lg:leading-[1.2]">
            <span className="lg:hidden">{l.titleShort}</span>
            <span className="hidden lg:inline">{l.title}</span>
          </h2>
          <p className="max-w-[520px] text-base leading-[1.7] text-deep-muted lg:text-[17px]">
            <span className="lg:hidden">{l.bodyShort}</span>
            <span className="hidden lg:inline">{l.body}</span>
          </p>
          <LabPhoto className="h-60 text-xs lg:hidden" />
          <div className="flex flex-col gap-5 lg:gap-0 lg:border-t lg:border-white/12">
            {l.benefits.map((b) => (
              <Benefit key={b.n} b={b} />
            ))}
          </div>
        </div>
        <LabPhoto className="hidden h-[600px] text-sm lg:flex" />
      </div>
    </section>
  );
}

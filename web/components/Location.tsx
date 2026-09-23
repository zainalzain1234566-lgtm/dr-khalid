import Image from "next/image";
import { ar, type Messages } from "@/lib/i18n";
import Reveal from "./motion/Reveal";
import { MAPS_EMBED, MAPS_URL } from "@/lib/site";
import { SectionTitle } from "./ui";

function Map({ l, className }: { l: Messages["location"]; className: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <iframe
        src={MAPS_EMBED}
        title={l.title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 size-full border-0"
      />
      <a
        href={MAPS_URL}
        target="_blank"
        rel="noopener"
        className="absolute bottom-3 start-3 rounded-full bg-surface px-4 py-2 text-sm font-semibold shadow-md"
      >
        {l.openMaps}
      </a>
    </div>
  );
}

export default function Location({ t = ar }: { t?: Messages }) {
  const l = t.location;
  return (
    <section id="contact" className="px-5 py-16 lg:px-8 lg:py-28">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[18px] lg:grid lg:grid-cols-[1fr_1.3fr] lg:items-stretch lg:gap-12">
        <Reveal className="flex flex-col gap-[18px] lg:gap-6">
          <div className="flex flex-col gap-[18px] lg:gap-3">
            <SectionTitle>{l.title}</SectionTitle>
          </div>
          <p className="text-[15px] leading-[1.7] lg:text-[17px]">{l.address}</p>
          <Image
            src="/clinic/01.webp"
            alt={l.buildingAlt}
            width={1536}
            height={1024}
            sizes="500px"
            className="hidden h-[220px] w-full rounded-md object-cover lg:block"
          />
          <Map l={l} className="h-[220px] rounded-[20px] lg:hidden" />
          <div className="rounded-md border border-line bg-surface">
            {l.hours.map((row) => (
              <div
                key={row.day}
                className="flex justify-between border-b border-line px-4 py-3.5 text-sm last:border-b-0 lg:px-5 lg:py-4 lg:text-base"
              >
                <span>{row.day}</span>
                <b dir={row.pending ? undefined : "ltr"} className={row.pending ? "text-ink-500" : "text-ink-900"}>
                  {row.time}
                </b>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1} className="hidden lg:block">
          <Map l={l} className="h-full min-h-[560px] rounded-lg" />
        </Reveal>
      </div>
    </section>
  );
}

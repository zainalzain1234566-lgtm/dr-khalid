import Image from "next/image";
import t from "@/messages/ar.json";
import { Eyebrow, SectionTitle } from "./ui";

const d = t.doctors;

/** Cutout on the shared arch backdrop; the head breaks out of the arch's top edge. */
function Portrait({ src, alt, frame, sizes }: { src: string; alt: string; frame: string; sizes: string }) {
  return (
    <div className={`relative overflow-hidden ${frame}`}>
      <div className="absolute inset-x-0 bottom-0 h-[78%] rounded-t-full bg-brand-100" />
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={1400}
        sizes={sizes}
        className="absolute top-0 left-1/2 h-[108%] w-auto max-w-none -translate-x-1/2"
      />
    </div>
  );
}

export default function Doctors() {
  return (
    <section id="doctors" className="relative overflow-hidden bg-brand-50 px-5 py-16 lg:px-8 lg:py-28">
      <Image
        src="/logo.webp"
        alt=""
        width={640}
        height={620}
        className="pointer-events-none absolute top-10 -end-[120px] hidden w-[640px] max-w-none opacity-5 lg:block"
      />
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-7 lg:gap-14">
        <div className="flex flex-col items-center gap-2 text-center lg:gap-3">
          <Eyebrow>{d.eyebrow}</Eyebrow>
          <SectionTitle>
            <span className="lg:hidden">{d.titleShort}</span>
            <span className="hidden lg:inline">{d.title}</span>
          </SectionTitle>
        </div>

        {/* Desktop: lead large, team smaller, heads aligned to the top */}
        <div className="hidden grid-cols-[1.5fr_1fr_1fr] items-start gap-8 lg:grid">
          {[{ ...d.lead, frame: "h-[560px]" }, ...d.team.map((m) => ({ ...m, frame: "h-[400px]" }))].map((doc) => (
            <div key={doc.name} className="flex flex-col gap-5">
              <Portrait src={doc.img} alt={doc.name} frame={`${doc.frame} rounded-b-lg`} sizes="480px" />
              <div className="flex flex-col gap-1 text-center">
                <b className="font-heading text-[22px] font-semibold text-ink-900">{doc.name}</b>
                <span className="text-[15px] text-ink-500">{doc.role}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="flex flex-col gap-2.5 lg:hidden">
          <Portrait src={d.lead.img} alt={d.lead.name} frame="h-[380px] rounded-b-lg" sizes="350px" />
          <b className="text-center font-heading text-[19px] font-semibold text-ink-900">{d.lead.name}</b>
          <span className="-mt-1.5 text-center text-sm text-ink-500">{d.lead.roleShort}</span>
        </div>
        <div className="grid grid-cols-2 gap-3.5 lg:hidden">
          {d.team.map((doc) => (
            <div key={doc.name} className="flex flex-col gap-2">
              <Portrait src={doc.img} alt={doc.name} frame="h-[220px] rounded-b-[20px]" sizes="240px" />
              <b className="text-center font-heading text-[15px] font-semibold text-ink-900">{doc.name}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

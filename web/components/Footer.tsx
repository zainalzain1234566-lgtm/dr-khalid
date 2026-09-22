import Image from "next/image";
import t from "@/messages/ar.json";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, PHONE_DISPLAY, phoneHref, whatsappHref } from "@/lib/site";

const f = t.footer;
const link = "text-deep-muted hover:text-white";

export default function Footer() {
  return (
    <footer className="bg-deep px-5 py-12 text-sm text-deep-muted lg:px-8 lg:pt-[72px] lg:pb-8 lg:text-base">
      {/* Desktop */}
      <div className="mx-auto hidden max-w-[1200px] flex-col gap-12 lg:flex">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
          <div className="flex flex-col gap-4">
            <Image src="/logo.webp" alt="" width={54} height={52} className="logo-white h-[52px] w-auto self-start" />
            <b className="font-heading text-lg font-semibold text-white">{f.name}</b>
          </div>
          <div className="flex flex-col gap-2.5">
            <b className="font-heading text-white">{f.contactTitle}</b>
            <a href={phoneHref} dir="ltr" className={`text-right ${link}`}>
              {PHONE_DISPLAY}
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener" className={link}>
              {f.whatsapp}
            </a>
          </div>
          <div className="flex flex-col gap-2.5">
            <b className="font-heading text-white">{f.instagramTitle}</b>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener" dir="ltr" className={`text-right ${link}`}>
              {INSTAGRAM_HANDLE}
            </a>
          </div>
          <div className="flex flex-col gap-2.5">
            <b className="font-heading text-white">{f.hoursTitle}</b>
            <span dir="ltr" className="text-right">
              {f.hours}
            </span>
            <span>{f.area}</span>
          </div>
        </div>
        <div className="border-t border-white/12 pt-6 text-sm">{f.copyright}</div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3.5 lg:hidden">
        <Image src="/logo.webp" alt="" width={45} height={44} className="logo-white h-11 w-auto self-start" />
        <b className="font-heading text-base font-semibold text-white">{f.name}</b>
        <span dir="ltr" className="text-right">
          <a href={phoneHref} className={link}>
            {PHONE_DISPLAY}
          </a>
          {" · "}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className={link}>
            {INSTAGRAM_HANDLE}
          </a>
        </span>
        <span>{f.copyrightShort}</span>
      </div>
    </footer>
  );
}

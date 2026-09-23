import Image from "next/image";
import { ar, type Messages } from "@/lib/i18n";
import { phoneHref, whatsappHref } from "@/lib/site";
import HeroIntro from "./motion/HeroMotion";
import TapLink from "./motion/TapLink";
import { WhatsAppIcon } from "./ui";

export default function Hero({ t = ar }: { t?: Messages }) {
  const h = t.hero;
  return (
    <HeroIntro
      className="relative mx-auto flex max-w-[1264px] flex-col gap-[22px] px-5 pt-6 pb-16 lg:grid lg:grid-cols-[1fr_560px] lg:items-center lg:gap-12 lg:px-8 lg:pt-10 lg:pb-24"
    >
      {/* Logo-stroke watermark (4–6% opacity) */}
      <Image
        src="/logo.webp"
        alt=""
        width={760}
        height={736}
        className="pointer-events-none absolute -top-10 -start-20 hidden w-[760px] max-w-none opacity-5 lg:block"
      />
      <Image
        src="/logo.webp"
        alt=""
        width={360}
        height={349}
        className="pointer-events-none absolute top-0 -end-10 w-[360px] max-w-none opacity-5 lg:hidden"
      />

      <div className="relative flex flex-col gap-[22px] lg:gap-7">
        <div data-hero="item">
          <h1 className="font-heading text-[34px] leading-[1.2] font-bold text-balance text-ink-900 lg:text-[56px] lg:leading-[1.15]">
            {h.titleBefore}
            <span className="text-brand-500">{h.titleAccent}</span>
            {h.titleAfter}
          </h1>
        </div>
        <div data-hero="item">
          <p className="max-w-[540px] text-base leading-[1.7] text-ink-700 lg:text-[19px]">
            <span className="lg:hidden">{h.subtitleShort}</span>
            <span className="hidden lg:inline">{h.subtitle}</span>
          </p>
        </div>

        <div data-hero="item" className="hidden gap-3 lg:flex">
          <TapLink
            lift
            href={whatsappHref}
            target="_blank"
            rel="noopener"
            className="flex h-14 items-center gap-2.5 rounded-full bg-whatsapp px-8 text-[17px] font-semibold text-white hover:text-white"
          >
            <WhatsAppIcon className="size-5" />
            {h.whatsapp}
          </TapLink>
          <TapLink
            lift
            href={phoneHref}
            className="flex h-14 items-center rounded-full border-[1.5px] border-brand-500 bg-surface px-8 text-[17px] font-semibold text-brand-700"
          >
            {h.call}
          </TapLink>
        </div>

        {/* Trust badges — desktop */}
        <div data-hero="item" className="mt-3 hidden max-w-[720px] grid-cols-4 gap-4 lg:grid">
          {h.badges.map((b) => (
            <div key={b.icon} className="flex items-center gap-3">
              <span
                dir="ltr"
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-100 font-heading text-[13px] font-bold text-brand-700"
              >
                {b.icon}
              </span>
              <div className="flex flex-col">
                <b className="font-heading text-[15px] font-semibold text-ink-900">
                  {b.title}
                </b>
                <span className="text-[13px] text-ink-500">{b.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges — mobile */}
        <div data-hero="item" className="grid grid-cols-2 gap-2 lg:hidden">
          {h.badges.map((b) => (
            <div
              key={b.icon}
              className="flex flex-col items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-3 text-center"
            >
              <span
                dir="ltr"
                className="flex size-10 items-center justify-center rounded-full bg-brand-100 font-heading text-[11px] font-bold text-brand-700"
              >
                {b.icon}
              </span>
              <b className="font-heading text-[13px] font-semibold text-ink-900">{b.mobileTitle}</b>
            </div>
          ))}
        </div>
      </div>

      {/* Dr. Khalid breaking out of the arch. The photo is the LCP element, so it stays static. */}
      <div className="relative order-first h-[400px] lg:order-none lg:h-[640px]">
        <div data-hero="arch" className="absolute inset-x-4 bottom-0 h-[320px] rounded-[999px_999px_28px_28px] bg-brand-100 lg:inset-x-5 lg:h-[520px]" />
        <div className="absolute inset-x-4 inset-y-0 overflow-hidden rounded-b-lg lg:inset-x-5">
          <Image
            src="/doctors/dr-khalid.webp"
            alt={h.doctorAlt}
            width={1229}
            height={1248}
            priority
            sizes="(min-width: 1024px) 600px, 380px"
            className="absolute bottom-0 left-1/2 h-[380px] w-auto max-w-none -translate-x-1/2 lg:h-[600px]"
          />
        </div>
        <div data-hero="card" className="absolute end-0 bottom-14 flex flex-col gap-0.5 rounded-md bg-surface px-3.5 py-2.5 shadow-[0_8px_28px_rgba(31,35,40,0.12)] lg:-end-6 lg:bottom-[110px] lg:gap-1.5 lg:px-5 lg:py-4 lg:shadow-lg">
          <b className="font-heading text-sm font-semibold text-ink-900 lg:text-[17px]">{h.cardName}</b>
          <span className="text-xs text-ink-500 lg:text-sm">{h.cardRole}</span>
        </div>
      </div>
    </HeroIntro>
  );
}

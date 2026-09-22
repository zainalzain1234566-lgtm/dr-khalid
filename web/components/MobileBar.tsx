import t from "@/messages/ar.json";
import { phoneHref, whatsappHref } from "@/lib/site";
import { WhatsAppIcon } from "./ui";

const m = t.mobileBar;

/** Sticky WhatsApp + Call bar, always visible on mobile. */
export default function MobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1.4fr_1fr] gap-2.5 border-t border-line bg-surface px-4 pt-3 pb-[max(18px,env(safe-area-inset-bottom))] lg:hidden">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener"
        className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-whatsapp text-base font-semibold text-white hover:text-white"
      >
        <WhatsAppIcon className="size-[18px]" />
        {m.whatsapp}
      </a>
      <a
        href={phoneHref}
        className="flex h-[52px] items-center justify-center rounded-full border-[1.5px] border-brand-500 text-base font-semibold text-brand-700"
      >
        {m.call}
      </a>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileBar from "@/components/MobileBar";
import TapLink from "@/components/motion/TapLink";
import { WhatsAppIcon } from "@/components/ui";
import { whatsappHref } from "@/lib/site";
import { approvedReviews } from "@/lib/reviews";
import ReviewsList from "./ReviewsList";

export const metadata: Metadata = { title: "آراء المرضى — عيادات الدكتور خالد العطار", alternates: { canonical: "/reviews" } };

const primary = "flex h-[52px] items-center justify-center rounded-full bg-brand-500 px-8 font-semibold text-white hover:bg-brand-600 hover:text-white";

export default async function ReviewsPage() {
  const reviews = await approvedReviews();
  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.stars, 0) / total : 0;
  const bars = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => r.stars === s).length }));

  return (
    <div className="themed overflow-x-clip pb-[84px] lg:pb-0">
      <Header />
      <main>
        <nav aria-label="مسار التنقل" className="mx-auto flex max-w-[1200px] gap-2 px-5 py-3.5 text-sm text-ink-500 lg:px-8 lg:pt-2 lg:pb-5">
          <Link href="/">الرئيسية</Link>
          <span>←</span>
          <span className="font-semibold text-ink-900">آراء المرضى</span>
        </nav>

        <section data-band className="bg-brand-50 px-5 py-8 lg:px-8 lg:py-14">
          <div className="mx-auto grid max-w-[1200px] items-center gap-6 lg:grid-cols-[1fr_1fr_auto] lg:gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-[15px] font-semibold text-brand-700">آراء المرضى</span>
              <h1 className="font-heading text-[28px] leading-tight font-bold text-ink-900 lg:text-[40px]">تجارب حقيقية من مرضانا</h1>
              {total > 0 && (
                <div className="mt-2 flex items-center gap-4">
                  <b className="font-heading text-[56px] leading-none font-bold text-ink-900 lg:text-7xl">{avg.toFixed(1)}</b>
                  <div className="flex flex-col gap-1">
                    <span dir="ltr" className="text-right text-[22px] tracking-[2px] text-warning">
                      {"★".repeat(Math.round(avg))}
                    </span>
                    <span className="text-sm text-ink-500">من {total} تقييم</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              {bars.map((b) => (
                <div key={b.s} className="grid grid-cols-[36px_1fr_36px] items-center gap-3 text-sm">
                  <span className="font-semibold text-ink-900">
                    {b.s} <span className="text-warning">★</span>
                  </span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-brand-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${total ? (b.n / total) * 100 : 0}%` }} />
                  </div>
                  <span className="text-left text-ink-500">{b.n}</span>
                </div>
              ))}
            </div>
            <TapLink href="/review" className={`${primary} w-full lg:w-auto`}>اكتب تقييمك</TapLink>
          </div>
        </section>

        <ReviewsList reviews={reviews} />

        <section className="px-4 pb-12 lg:px-8 lg:pb-24">
          <div data-band className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 rounded-lg bg-brand-100 px-5 py-8 text-center lg:flex-row lg:px-14 lg:py-12 lg:text-right">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-[22px] leading-tight font-bold text-ink-900 lg:text-[30px]">هل زرت عيادتنا؟ شاركنا تجربتك</h2>
              <p className="text-ink-700">تقييمك يساعد غيرك يختار بثقة.</p>
            </div>
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
              <TapLink href="/review" className={primary}>اكتب تقييمك</TapLink>
              <TapLink
                href={whatsappHref}
                target="_blank"
                rel="noopener"
                className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-whatsapp px-7 font-semibold text-white hover:text-white"
              >
                <WhatsAppIcon className="size-5" />
                احجز عبر واتساب
              </TapLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBar />
    </div>
  );
}

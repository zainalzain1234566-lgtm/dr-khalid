import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileBar from "@/components/MobileBar";
import TapLink from "@/components/motion/TapLink";
import { allCases } from "@/lib/cases";
import { ar } from "@/lib/i18n";
import CasesGrid from "./CasesGrid";

export const metadata: Metadata = { title: "حالاتنا قبل وبعد | عيادات الدكتور خالد العطار", alternates: { canonical: "/cases" } };

export default async function CasesPage() {
  const cases = await allCases(ar);

  return (
    <div className="overflow-x-clip pb-[84px] lg:pb-0">
      <Header />
      <main>
        <nav aria-label="مسار التنقل" className="mx-auto flex max-w-[1200px] gap-2 px-5 py-3.5 text-sm text-ink-500 lg:px-8 lg:pt-2 lg:pb-5">
          <Link href="/">الرئيسية</Link>
          <span>←</span>
          <span className="font-semibold text-ink-900">حالاتنا</span>
        </nav>

        <section className="bg-brand-50 px-5 py-8 lg:px-8 lg:py-14">
          <div className="mx-auto grid max-w-[1200px] items-center gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-[15px] font-semibold text-brand-700">حالاتنا</span>
              <h1 className="font-heading text-[28px] leading-tight font-bold text-ink-900 lg:text-[40px]">نتائج حقيقية لمرضانا</h1>
              <p className="max-w-[52ch] leading-relaxed text-ink-700">جميع الصور لحالات عولجت في عيادتنا وبموافقة المرضى.</p>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              {[
                [String(cases.length), "حالة موثقة"],
                ["16", "سنة خبرة"],
              ].map(([n, l]) => (
                <div key={l} className="flex flex-col-reverse gap-1 rounded-[16px] bg-surface p-4 lg:p-5">
                  <dt className="text-sm text-ink-500">{l}</dt>
                  <dd className="font-heading text-[26px] leading-none font-bold text-ink-900 lg:text-[32px]">{n}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <CasesGrid cases={cases} />

        <section className="px-4 pb-12 lg:px-8 lg:pb-24">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 rounded-lg bg-brand-100 px-5 py-8 text-center lg:flex-row lg:px-14 lg:py-12 lg:text-right">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-[22px] leading-tight font-bold text-ink-900 lg:text-[30px]">هل تريد نتيجة مماثلة؟</h2>
              <p className="text-ink-700">احجز استشارة ونضع لك خطة علاج واضحة.</p>
            </div>
            <TapLink
              href="/book"
              className="flex h-[52px] w-full items-center justify-center rounded-full bg-brand-500 px-8 font-semibold text-white hover:bg-brand-600 hover:text-white lg:w-auto"
            >
              احجز موعد
            </TapLink>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBar />
    </div>
  );
}

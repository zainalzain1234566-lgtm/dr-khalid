import Header from "@/components/Header";

// Shown instantly on navigation while the page reads uploaded cases from Blob storage.
// Static parts are real; only data-driven parts (stats, chips, cards) are skeletons.
const bone = "rounded-[8px] bg-line motion-safe:animate-pulse";

export default function Loading() {
  return (
    <div className="themed overflow-x-clip pb-[84px] lg:pb-0" aria-busy="true" aria-label="جارٍ تحميل الحالات">
      <Header />
      <main>
        <nav className="mx-auto flex max-w-[1200px] gap-2 px-5 py-3.5 text-sm text-ink-500 lg:px-8 lg:pt-2 lg:pb-5">
          <span>الرئيسية</span>
          <span>←</span>
          <span className="font-semibold text-ink-900">حالاتنا</span>
        </nav>

        <section data-band className="bg-brand-50 px-5 py-8 lg:px-8 lg:py-14">
          <div className="mx-auto grid max-w-[1200px] items-center gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-[15px] font-semibold text-brand-700">حالاتنا</span>
              <h1 className="font-heading text-[28px] leading-tight font-bold text-ink-900 lg:text-[40px]">نتائج حقيقية لمرضانا</h1>
              <p className="max-w-[52ch] leading-relaxed text-ink-700">جميع الصور لحالات عولجت في عيادتنا وبموافقة المرضى.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="flex flex-col gap-2 rounded-[16px] bg-surface p-4 lg:p-5">
                  <i className={`${bone} h-7 w-12`} />
                  <i className={`${bone} h-3.5 w-20`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="border-b border-line">
          <div className="mx-auto flex max-w-[1200px] gap-2 overflow-hidden px-4 py-2.5 lg:px-8 lg:py-4">
            {[64, 120, 120, 132, 150].map((w, i) => (
              <i key={i} className={`${bone} h-11 flex-none rounded-full`} style={{ width: w }} />
            ))}
          </div>
        </div>

        <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-4 pt-5 pb-12 lg:grid-cols-3 lg:px-8 lg:pt-10 lg:pb-20">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-[16px] bg-surface">
              <i className={`${bone} aspect-[4/3] rounded-none`} />
              <div className="flex flex-col gap-3 p-5">
                <i className={`${bone} h-6 w-24`} />
                <i className={`${bone} h-4 w-3/4`} />
                <i className={`${bone} h-3.5 w-1/3`} />
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

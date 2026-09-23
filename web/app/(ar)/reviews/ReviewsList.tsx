"use client";

import { useState } from "react";
import t from "@/messages/ar.json";
import type { Review } from "@/lib/reviews";

const ALL = "الكل";
const chips = [ALL, ...t.services.items.map((s) => s.t)];
const doctors = [t.doctors.lead, ...t.doctors.team].map((d) => d.name);
const sorts = ["الأحدث", "الأعلى تقييماً", "الأقل تقييماً"];
const PAGE = 12;
const fmt = new Intl.DateTimeFormat("ar-IQ", { day: "numeric", month: "long", year: "numeric", numberingSystem: "latn" });

const pill = (on: boolean) =>
  `flex-none h-11 rounded-full border-[1.5px] px-[18px] font-semibold ${on ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-surface text-ink-700"}`;
const select = "h-11 rounded-[12px] border-[1.5px] border-line bg-surface px-3 font-medium text-ink-900";

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  const [chip, setChip] = useState(ALL);
  const [doc, setDoc] = useState("");
  const [sort, setSort] = useState(sorts[0]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [sheet, setSheet] = useState(false);
  const [shown, setShown] = useState(PAGE);

  let list = reviews.filter((r) => (chip === ALL || r.case === chip) && (!doc || r.doctor === doc));
  if (sort === sorts[1]) list = [...list].sort((a, b) => b.stars - a.stars);
  if (sort === sorts[2]) list = [...list].sort((a, b) => a.stars - b.stars);

  return (
    <>
      <div className="sticky top-[73px] z-10 border-b border-line lg:top-0 bg-bg/95">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-2.5 lg:px-8 lg:py-4">
          <div role="group" aria-label="نوع العلاج" className="flex flex-1 gap-2 overflow-x-auto [scrollbar-width:none]">
            {chips.map((c) => (
              <button key={c} aria-pressed={chip === c} onClick={() => { setChip(c); setShown(PAGE); }} className={pill(chip === c)}>
                {c}
              </button>
            ))}
          </div>
          <label className="hidden items-center gap-2 text-sm text-ink-500 lg:flex">
            الطبيب
            <select value={doc} onChange={(e) => setDoc(e.target.value)} className={select}>
              <option value="">كل الأطباء</option>
              {doctors.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label className="hidden items-center gap-2 text-sm text-ink-500 lg:flex">
            الترتيب
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={select}>
              {sorts.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <button
            onClick={() => setSheet(true)}
            className="flex h-11 flex-none items-center gap-1.5 rounded-full border-[1.5px] border-ink-900 bg-surface px-3.5 text-sm font-semibold text-ink-900 lg:hidden"
          >
            تصفية
            {(doc || sort !== sorts[0]) && <i className="size-2 rounded-full bg-brand-500" />}
          </button>
        </div>
      </div>

      <section className="mx-auto max-w-[1200px] px-4 pt-5 pb-12 lg:px-8 lg:pt-10 lg:pb-[72px]">
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-5 py-16 text-center">
            <svg width="96" height="104" viewBox="0 0 96 104" aria-hidden="true">
              <path d="M48 16C38 6 14 6 10 28c-3 18 6 30 10 46 4 18 8 26 14 26 7 0 6-24 14-24s7 24 14 24c6 0 10-8 14-26 4-16 13-28 10-46C82 6 58 6 48 16z" fill="var(--brand-100)" stroke="var(--brand-500)" strokeWidth="3" strokeLinejoin="round" />
            </svg>
            <b className="font-heading text-xl font-semibold text-ink-900">
              {reviews.length ? "لا توجد تقييمات لهذا العلاج بعد" : "لا توجد تقييمات بعد"}
            </b>
            {reviews.length > 0 && (
              <>
                <span className="text-[15px] text-ink-500">جرّب علاجاً آخر أو اعرض كل التقييمات.</span>
                <button onClick={() => { setChip(ALL); setDoc(""); }} className="min-h-11 font-semibold text-brand-700 underline">
                  إزالة الفلاتر
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="columns-1 gap-5 lg:columns-3">
              {list.slice(0, shown).map((r, i) => {
                const feat = i % 6 === 5;
                const long = r.text.length > 150;
                const isOpen = !!open[r.id];
                return (
                  <article
                    key={r.id}
                    className={`mb-5 flex break-inside-avoid flex-col gap-3.5 shadow-sm ${
                      feat ? "rounded-lg border-2 border-[#f3c4c3] bg-bg p-8" : "rounded-md bg-surface p-6"
                    }`}
                  >
                    {feat && <span className="self-start text-[13px] font-semibold text-brand-700">تقييم مميز</span>}
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 flex-none items-center justify-center rounded-full bg-brand-100 font-heading text-lg font-bold text-brand-700">
                        {(r.name || "م")[0]}
                      </span>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <b className="font-heading font-semibold text-ink-900">{r.name || "مراجع"}</b>
                        <span className="text-[13px] text-ink-500">{fmt.format(new Date(r.date))}</span>
                      </div>
                      <span dir="ltr" role="img" aria-label={`${r.stars} من 5 نجوم`} className="text-[15px] tracking-[1px] text-warning">
                        {"★".repeat(r.stars) + "☆".repeat(5 - r.stars)}
                      </span>
                    </div>
                    {r.text && (
                      <p className={`leading-[1.75] text-ink-700 ${feat ? "text-lg" : ""} ${isOpen ? "" : "line-clamp-5"}`}>{r.text}</p>
                    )}
                    {long && (
                      <button
                        aria-expanded={isOpen}
                        onClick={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
                        className="min-h-8 self-start text-sm font-semibold text-brand-700"
                      >
                        {isOpen ? "عرض أقل" : "اقرأ المزيد"}
                      </button>
                    )}
                    <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3.5 text-[13px]">
                      <span className="rounded-sm bg-brand-100 px-2.5 py-[3px] font-semibold text-brand-700">{r.case}</span>
                      <span className="rounded-sm border border-line px-2.5 py-[3px] text-ink-700">مع {r.doctor}</span>
                      <span className="ms-auto text-xs font-semibold text-[#2e7d5b]">✓ مراجعة موثقة</span>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="mt-5 flex flex-col items-center gap-3">
              <span className="text-sm text-ink-500">{Math.min(shown, list.length)} من {list.length}</span>
              {shown < list.length && (
                <button
                  onClick={() => setShown((n) => n + PAGE)}
                  className="h-[52px] w-full rounded-full border-[1.5px] border-brand-500 bg-surface px-10 font-semibold text-brand-700 lg:w-auto"
                >
                  عرض المزيد
                </button>
              )}
            </div>
          </>
        )}
      </section>

      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div onClick={() => setSheet(false)} className="absolute inset-0 bg-ink-900/45" />
          <div role="dialog" aria-modal="true" aria-label="تصفية" className="absolute inset-x-0 bottom-0 flex flex-col gap-5 rounded-t-lg bg-surface px-5 pt-3 pb-6">
            <i className="h-1 w-10 self-center rounded bg-line" />
            <div className="flex items-center justify-between">
              <b className="font-heading text-xl font-semibold text-ink-900">تصفية</b>
              <button onClick={() => { setDoc(""); setSort(sorts[0]); }} className="min-h-11 font-semibold text-brand-700">مسح</button>
            </div>
            <div role="radiogroup" aria-label="الطبيب" className="flex flex-col gap-2">
              <b className="font-heading text-[15px] font-semibold text-ink-900">الطبيب</b>
              {[["", "كل الأطباء"], ...doctors.map((d) => [d, d])].map(([v, l]) => (
                <button
                  key={v}
                  role="radio"
                  aria-checked={doc === v}
                  onClick={() => setDoc(v)}
                  className={`flex min-h-12 items-center justify-between rounded-[12px] border-[1.5px] px-3.5 font-medium text-ink-900 ${
                    doc === v ? "border-brand-500 bg-brand-50" : "border-line bg-surface"
                  }`}
                >
                  {l}
                  <i className={`size-5 rounded-full ${doc === v ? "border-[6px] border-brand-500" : "border-[1.5px] border-[#c9c2be]"}`} />
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <b className="font-heading text-[15px] font-semibold text-ink-900">الترتيب</b>
              <div className="flex flex-wrap gap-2">
                {sorts.map((s) => (
                  <button key={s} aria-pressed={sort === s} onClick={() => setSort(s)} className={`${pill(sort === s)} text-sm`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setSheet(false)} className="h-[52px] rounded-full bg-brand-500 font-semibold text-white">
              عرض {list.length} تقييم
            </button>
          </div>
        </div>
      )}
    </>
  );
}

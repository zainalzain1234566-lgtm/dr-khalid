"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import t from "@/messages/ar.json";

const doctors = [t.doctors.lead, ...t.doctors.team];
const cases = t.services.items.map((s) => s.t);
const labels = ["", "سيئ", "مقبول", "جيد", "جيد جداً", "ممتاز"];
const err = "text-sm font-medium text-[#c0392b]";
const legend = "p-0 font-heading text-[17px] font-semibold text-ink-900";
const ring = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-500/45";

export default function ReviewForm() {
  const [doc, setDoc] = useState<number | null>(null);
  const [rate, setRate] = useState(0);
  const [cs, setCs] = useState("");
  const [desc, setDesc] = useState("");
  const [errs, setErrs] = useState(false);
  const [phase, setPhase] = useState<"form" | "busy" | "net" | "success">("form");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (doc == null || !rate || !cs) return setErrs(true);
    setErrs(false);
    setPhase("busy");
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ doctor: doctors[doc].name, stars: rate, case: cs, text: desc }),
    }).catch(() => null);
    setPhase(res?.ok ? "success" : "net");
  }

  if (phase === "success") {
    return (
      <div className="flex flex-col items-center gap-[18px] rounded-lg bg-surface px-5 py-12 text-center shadow-sm lg:px-10 lg:py-16">
        <span className="flex size-[88px] items-center justify-center rounded-full bg-brand-100 text-[40px] text-brand-500">✓</span>
        <h1 className="font-heading text-[30px] leading-tight font-bold text-ink-900 lg:text-[44px]">شكراً لتقييمك</h1>
        <p className="max-w-[420px] leading-[1.7] text-ink-500">وصلنا تقييمك لـ{doctors[doc!].name}.</p>
        <span dir="ltr" className="text-[26px] tracking-[4px] text-warning">{"★".repeat(rate)}</span>
        <Link href="/" className="mt-2 flex h-[52px] items-center rounded-full bg-brand-500 px-8 font-semibold text-white hover:bg-brand-600 hover:text-white">
          العودة إلى الرئيسية
        </Link>
      </div>
    );
  }

  const busy = phase === "busy";
  return (
    <>
      <div className="flex flex-col gap-2.5 text-center">
        <span className="text-sm font-semibold text-brand-700">آراء المراجعين</span>
        <h1 className="font-heading text-[30px] leading-tight font-bold text-ink-900 lg:text-[44px]">قيّم تجربتك</h1>
        <p className="leading-[1.7] text-ink-500">رأيك يساعدنا نطوّر خدمتنا ويساعد غيرك يختار بثقة.</p>
      </div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-8 rounded-lg bg-surface p-5 shadow-sm lg:p-10">
        {phase === "net" && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-md border border-[#f3c4c3] bg-[#fdecec] px-4 py-3.5">
            <span className="text-[15px] font-semibold text-brand-700">تعذّر إرسال التقييم. تحقق من الاتصال وحاول مجدداً.</span>
            <button type="submit" className="min-h-11 shrink-0 font-bold text-brand-700 underline">إعادة المحاولة</button>
          </div>
        )}

        <fieldset className="flex flex-col gap-3.5">
          <legend className={`${legend} mb-3.5`}>اختر الطبيب <span className="text-brand-500">*</span></legend>
          <div className="grid grid-cols-3 gap-2 lg:gap-4">
            {doctors.map((d, i) => {
              const on = doc === i;
              return (
                <label
                  key={d.name}
                  className={`relative flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 px-2 py-3 transition-all duration-200 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-brand-500/45 ${
                    on ? "border-brand-500 bg-brand-50 shadow-[0_0_0_4px_rgba(221,100,97,0.15)]" : errs && doc == null ? "border-[#e7a3a1] bg-surface" : "border-line bg-surface"
                  }`}
                >
                  <input type="radio" name="doctor" checked={on} onChange={() => setDoc(i)} className="sr-only" />
                  <div className="relative h-24 w-full overflow-hidden rounded-b-[12px] lg:h-40">
                    <div className="absolute inset-x-[6%] bottom-0 h-4/5 rounded-t-full rounded-b-[12px] bg-brand-100" />
                    <Image src={d.img} alt="" fill sizes="200px" className="object-contain object-top" />
                  </div>
                  <b className="text-center font-heading text-xs font-semibold text-ink-900 lg:text-[15px]">{d.name}</b>
                  <span className="text-center text-xs text-ink-500">{i === 0 ? t.doctors.lead.roleShort : "طبيب أسنان"}</span>
                </label>
              );
            })}
          </div>
          {errs && doc == null && <span role="alert" className={err}>يرجى اختيار الطبيب</span>}
        </fieldset>

        <fieldset className="flex flex-col items-center gap-2.5">
          <legend className={`${legend} mb-3 w-full`}>التقييم <span className="text-brand-500">*</span></legend>
          <div dir="ltr" className="flex gap-1 lg:gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                aria-label={`${n} ${labels[n]}`}
                className={`flex size-[52px] cursor-pointer items-center justify-center rounded-[12px] text-[40px] leading-none transition hover:scale-110 focus-within:outline-3 focus-within:outline-brand-500/45 lg:size-[60px] lg:text-5xl ${
                  n <= rate ? "text-warning" : "text-[#e4dcd8]"
                }`}
              >
                <input type="radio" name="rating" checked={rate === n} onChange={() => setRate(n)} className="sr-only" />★
              </label>
            ))}
          </div>
          <span className={`min-h-6 font-heading font-semibold ${rate ? "text-ink-900" : "text-ink-500"}`}>
            {rate ? labels[rate] : "اضغط على النجوم للتقييم"}
          </span>
          {errs && !rate && <span role="alert" className={err}>يرجى اختيار عدد النجوم</span>}
        </fieldset>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="case" className={legend}>الحالة / العلاج <span className="text-brand-500">*</span></label>
          <select
            id="case"
            value={cs}
            onChange={(e) => setCs(e.target.value)}
            className={`h-[52px] rounded-[12px] border-[1.5px] bg-bg px-4 font-medium ${ring} ${cs ? "text-ink-900" : "text-ink-500"} ${
              errs && !cs ? "border-[#c0392b]" : "border-line"
            }`}
          >
            <option value="">اختر نوع العلاج</option>
            {cases.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errs && !cs && <span role="alert" className={err}>يرجى اختيار نوع العلاج</span>}
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="desc" className={legend}>
            وصف التجربة <span className="font-body text-sm font-normal text-ink-500">(اختياري)</span>
          </label>
          <textarea
            id="desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value.slice(0, 2000))}
            maxLength={2000}
            rows={5}
            placeholder="احكِ لنا عن تجربتك…"
            className={`resize-y rounded-[12px] border-[1.5px] border-line bg-bg px-4 py-3.5 leading-[1.7] text-ink-900 ${ring}`}
          />
          <span dir="ltr" className="self-end text-[13px] text-ink-500">{desc.length} / 2000</span>
        </div>

        <button
          type="submit"
          disabled={busy}
          className={`flex h-[52px] w-full items-center justify-center gap-2.5 self-center rounded-full bg-brand-500 px-10 text-[17px] font-semibold text-white hover:bg-brand-600 disabled:opacity-85 lg:w-auto ${ring}`}
        >
          {busy && <i className="size-[18px] animate-spin rounded-full border-[2.5px] border-white/40 border-t-white" />}
          {busy ? "جارٍ الإرسال…" : "إرسال التقييم"}
        </button>
      </form>
    </>
  );
}

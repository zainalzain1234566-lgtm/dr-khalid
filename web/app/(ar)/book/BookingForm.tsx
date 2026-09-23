"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import t from "@/messages/ar.json";
import { whatsappHref } from "@/lib/site";

const ANY = "أي طبيب متاح";
const doctors = [t.doctors.lead, ...t.doctors.team];
const cases = ["فحص واستشارة", "ألم أسنان (طارئ)", "زراعة", "تقويم", "فينير / ابتسامة هوليود", "تبييض", "حشوة / علاج عصب", "تنظيف", "أخرى"];
const glyphs = ["?", "!", "Z", "T", "V", "W", "F", "C", "+"];
const OTHER = cases.length - 1;
const periods = [["أي وقت مساءً", "3:00 PM – 8:00 PM"]];
const slots = ["3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"];
const stepNames = ["الطبيب", "الحالة", "الموعد", "بياناتك"];
const wd = new Intl.DateTimeFormat("ar-IQ", { weekday: "long" });
const mon = new Intl.DateTimeFormat("ar-IQ", { month: "long" });
const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return { d, name: i === 0 ? "اليوم" : wd.format(d), closed: d.getDay() === 5 };
});

const card = (on: boolean) =>
  `cursor-pointer rounded-md border-2 transition-all duration-200 ${on ? "border-brand-500 bg-brand-50" : "border-line bg-surface hover:border-brand-100"}`;
const h2 = "font-heading text-xl font-semibold text-ink-900 lg:text-2xl";
const backBtn = "min-h-11 self-start font-semibold text-brand-700";
const input = "h-[52px] rounded-[12px] border-[1.5px] bg-white px-4 text-base text-ink-900";
const primary = "h-[52px] rounded-full bg-brand-500 px-8 font-semibold text-white hover:bg-brand-600 disabled:opacity-45";

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [doc, setDoc] = useState<number | null>(null);
  const [cs, setCs] = useState<number | null>(null);
  const [other, setOther] = useState("");
  const [day, setDay] = useState<number | null>(null);
  const [per, setPer] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errs, setErrs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [net, setNet] = useState(false);
  const [sheet, setSheet] = useState(false);

  const docLabel = doc == null ? null : doc === doctors.length ? ANY : doctors[doc].name;
  const caseLabel = cs == null ? null : cs === OTHER && other.trim() ? `أخرى: ${other.trim()}` : cases[cs];
  const d = day == null ? null : days[day];
  const dayLabel = d ? `${d.name} ${d.d.getDate()}/${d.d.getMonth() + 1}` : null;
  const timeLabel = slot ?? (per != null ? periods[per][0] : null);
  const phoneOk = /^7\d{9}$/.test(phone.replace(/\s/g, ""));
  const nameOk = name.trim().split(/\s+/).length >= 2;
  const cant = [doc == null, cs == null, day == null || timeLabel == null, false][step - 1];
  const go = (n: number) => { setStep(n); setSheet(false); };

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!nameOk || !phoneOk) return setErrs(true);
    setErrs(false);
    setBusy(true);
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ doctor: docLabel, case: caseLabel, day: dayLabel, time: timeLabel, name, phone, note }),
    }).catch(() => null);
    setBusy(false);
    setNet(!res?.ok);
    if (res?.ok) go(5);
  }

  const sum: [string, string | null, number][] = [
    ["الطبيب", docLabel, 1],
    ["الحالة", caseLabel, 2],
    ["الموعد", dayLabel && `${dayLabel} · ${timeLabel ?? "—"}`, 3],
    ["بياناتك", name.trim() || null, 4],
  ];

  if (step === 5) {
    return (
      <section className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-[18px] rounded-lg bg-surface px-5 py-9 text-center shadow-sm lg:px-10 lg:py-14">
        <span className="flex size-24 items-center justify-center rounded-full bg-brand-100 text-[44px] text-brand-500">✓</span>
        <h1 className="font-heading text-[26px] leading-tight font-bold text-ink-900 lg:text-4xl">تم استلام طلب حجزك</h1>
        <p className="max-w-[440px] leading-[1.7]">سنتواصل معك عبر واتساب لتأكيد الموعد خلال ساعات العمل.</p>
        <div className="w-full max-w-[460px] rounded-md border border-line text-start">
          {[["الطبيب", docLabel], ["الحالة", caseLabel], ["اليوم", dayLabel], ["الفترة", timeLabel], ["الاسم", name]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-line px-[18px] py-3.5 text-[15px] last:border-0">
              <span className="text-ink-500">{k}</span>
              <b className="font-semibold text-ink-900">{v || "—"}</b>
            </div>
          ))}
        </div>
        <Link href="/" className="flex h-[52px] items-center rounded-full bg-brand-500 px-6 font-semibold text-white hover:bg-brand-600 hover:text-white">
          العودة للرئيسية
        </Link>
        <a href={whatsappHref} target="_blank" rel="noopener" className="flex min-h-11 items-center gap-2 font-semibold text-[#1F8A4C]">
          <i className="size-2 rounded-full bg-[#25D366]" />
          راسل العيادة على واتساب
        </a>
      </section>
    );
  }

  const summaryRows = (compact: boolean) =>
    sum.map(([k, v, st], i) => (
      <div key={k} className={`flex items-center gap-3 border-b border-line ${compact ? "py-2.5" : "px-5 py-4"}`}>
        {!compact && (
          <span className={`flex size-7 flex-none items-center justify-center rounded-full font-heading text-[13px] font-semibold ${v ? "bg-brand-500 text-white" : "bg-brand-100 text-brand-700"}`}>
            {v ? "✓" : i + 1}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] text-ink-500">{k}</span>
          <b className={`text-[15px] font-semibold ${v ? "text-ink-900" : "text-[#A9A29E]"}`}>{v || "لم يُحدد بعد"}</b>
        </div>
        {v && st !== step && (
          <button type="button" onClick={() => go(st)} className="min-h-11 px-1 text-sm font-semibold text-brand-700">تعديل</button>
        )}
      </div>
    ));

  return (
    <div className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-6 lg:gap-8">
        <div className="flex flex-col gap-3.5">
          <h1 className="font-heading text-[26px] leading-tight font-bold text-ink-900 lg:text-4xl">احجز موعدك</h1>
          <ol aria-label="خطوات الحجز" className="grid grid-cols-4 gap-2">
            {stepNames.map((l, i) => (
              <li key={l} aria-current={step === i + 1 ? "step" : undefined} className="flex flex-col gap-2">
                <i className={`h-1.5 rounded-full ${i < step ? "bg-brand-500" : "bg-brand-100"}`} />
                <span className={`text-xs font-semibold lg:text-sm ${i + 1 === step ? "text-ink-900" : i + 1 < step ? "text-brand-700" : "text-ink-500"}`}>
                  {i + 1} {l}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {step === 1 && (
          <section className="flex flex-col gap-[18px]">
            <h2 className={h2}>اختر الطبيب</h2>
            <div role="radiogroup" aria-label="الطبيب" className="grid grid-cols-2 gap-2.5 lg:grid-cols-[1.3fr_1fr_1fr] lg:gap-4">
              {doctors.map((x, i) => (
                <button key={x.name} type="button" role="radio" aria-checked={doc === i} onClick={() => setDoc(i)}
                  className={`relative flex flex-col items-center gap-2 px-2.5 pt-3 pb-4 ${card(doc === i)} ${doc === i ? "shadow-[0_0_0_4px_rgba(221,100,97,0.15)]" : ""}`}>
                  {doc === i && <span className="absolute end-2.5 top-2.5 z-10 flex size-7 items-center justify-center rounded-full bg-brand-500 text-[15px] font-bold text-white">✓</span>}
                  <div className={`relative w-full overflow-hidden rounded-b-[12px] ${i === 0 ? "h-40 lg:h-[200px]" : "h-40"}`}>
                    <div className="absolute inset-x-[8%] bottom-0 h-4/5 rounded-t-full rounded-b-[12px] bg-brand-100" />
                    <Image src={x.img} alt="" fill sizes="240px" className="object-contain object-top" />
                  </div>
                  <b className="text-center font-heading text-[15px] font-semibold text-ink-900">{x.name}</b>
                  <span className="text-center text-[13px] text-ink-500">{x.role}</span>
                </button>
              ))}
            </div>
            <button type="button" role="radio" aria-checked={doc === doctors.length} onClick={() => setDoc(doctors.length)}
              className={`flex min-h-16 items-center justify-between gap-3 px-5 text-start ${card(doc === doctors.length)}`}>
              <div className="flex flex-col gap-0.5">
                <b className="font-heading text-[17px] font-semibold text-ink-900">{ANY}</b>
                <span className="text-[13px] text-ink-500">نختار لك أقرب موعد مع الطبيب المناسب لحالتك</span>
              </div>
              <i className={`size-[22px] flex-none rounded-full ${doc === doctors.length ? "border-[7px] border-brand-500" : "border-[1.5px] border-[#C9C2BE]"}`} />
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="flex flex-col gap-[18px]">
            <button type="button" onClick={() => go(1)} className={backBtn}>→ رجوع</button>
            <h2 className={h2}>ما سبب الزيارة؟</h2>
            <div role="radiogroup" aria-label="الحالة" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {cases.map((l, i) => (
                <button key={l} type="button" role="radio" aria-checked={cs === i} onClick={() => setCs(i)}
                  className={`relative flex min-h-[88px] flex-col items-start justify-center gap-2 px-4 py-3.5 text-start ${card(cs === i)}`}>
                  <span className={`flex size-9 items-center justify-center rounded-full font-heading text-[13px] font-bold ${cs === i ? "bg-brand-500 text-white" : "bg-brand-100 text-brand-700"}`}>{glyphs[i]}</span>
                  <b className="font-heading text-[15px] font-semibold text-ink-900">{l}</b>
                  {i === 1 && <span className="absolute end-3 top-3 rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-semibold text-white">أولوية</span>}
                </button>
              ))}
            </div>
            {cs === OTHER && (
              <label className="flex flex-col gap-2">
                <b className="font-heading text-[15px] font-semibold text-ink-900">اكتب حالتك</b>
                <input value={other} onChange={(e) => setOther(e.target.value)} maxLength={120} placeholder="مثلاً: كسر في سن أمامي" className={`${input} border-line`} />
              </label>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="flex flex-col gap-[18px]">
            <button type="button" onClick={() => go(2)} className={backBtn}>→ رجوع</button>
            <h2 className={h2}>اختر اليوم</h2>
            <div role="radiogroup" aria-label="اليوم" className="flex gap-2.5 overflow-x-auto pb-1.5">
              {days.map((x, i) => {
                const on = day === i;
                return (
                  <button key={i} type="button" role="radio" aria-checked={on} disabled={x.closed} onClick={() => { setDay(i); setSlot(null); }}
                    className={`flex h-[88px] w-[76px] flex-none flex-col items-center justify-center gap-1 rounded-md border-2 disabled:cursor-not-allowed disabled:opacity-50 ${on ? "border-brand-500 bg-brand-500 text-white" : x.closed ? "border-line bg-[#F4EEEB]" : "border-line bg-white"}`}>
                    <span className={`text-[13px] ${on ? "" : "text-ink-500"}`}>{x.name}</span>
                    <b className={`font-heading text-[22px] font-bold ${on ? "" : "text-ink-900"} ${x.closed ? "line-through" : ""}`}>{x.d.getDate()}</b>
                    <span className={`text-[11px] ${on ? "" : "text-ink-500"}`}>{x.closed ? "مغلق" : mon.format(x.d)}</span>
                  </button>
                );
              })}
            </div>
            {day != null && (
              <div className="flex flex-col gap-3">
                <h3 className="font-heading text-[17px] font-semibold text-ink-900">الفترة</h3>
                <div role="radiogroup" aria-label="الفترة" className="grid gap-3">
                  {periods.map(([l, tm], i) => (
                    <button key={l} type="button" role="radio" aria-checked={per === i && !slot} onClick={() => { setPer(i); setSlot(null); }}
                      className={`flex min-h-16 flex-col items-center justify-center gap-0.5 ${card(per === i && !slot)}`}>
                      <b className="font-heading font-semibold text-ink-900">{l}</b>
                      <span dir="ltr" className="text-[13px] text-ink-500">{tm}</span>
                    </button>
                  ))}
                </div>
                <h3 className="mt-1.5 font-heading text-[17px] font-semibold text-ink-900">أو اختر وقتاً محدداً</h3>
                <div role="radiogroup" aria-label="الوقت" className="grid grid-cols-3 gap-2 lg:grid-cols-5">
                  {slots.map((s) => (
                    <button key={s} type="button" dir="ltr" role="radio" aria-checked={slot === s} onClick={() => { setSlot(s); setPer(0); }}
                      className={`h-12 rounded-[12px] border-[1.5px] text-[15px] font-semibold ${slot === s ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-white text-ink-900"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {step === 4 && (
          <form id="book" onSubmit={submit} noValidate className="flex flex-col gap-5">
            <button type="button" onClick={() => go(3)} className={backBtn}>→ رجوع</button>
            <h2 className={h2}>بياناتك</h2>
            {net && (
              <div role="alert" className="rounded-md border border-[#f3c4c3] bg-[#fdecec] px-4 py-3.5 text-[15px] font-semibold text-brand-700">
                تعذّر إرسال الطلب. تحقق من الاتصال وحاول مجدداً.
              </div>
            )}
            <label className="flex flex-col gap-2">
              <b className="font-heading text-[15px] font-semibold text-ink-900">الاسم الكامل <span className="text-brand-500">*</span></b>
              <input value={name} onChange={(e) => setName(e.target.value)} aria-invalid={errs && !nameOk} autoComplete="name" maxLength={60}
                placeholder="مثلاً: زينب علي حسين" className={`${input} ${errs && !nameOk ? "border-[#C0392B]" : "border-line"}`} />
              {errs && !nameOk && <span role="alert" className="text-sm font-medium text-[#C0392B]">يرجى كتابة الاسم الكامل</span>}
            </label>
            <label className="flex flex-col gap-2">
              <b className="font-heading text-[15px] font-semibold text-ink-900">رقم الهاتف / واتساب <span className="text-brand-500">*</span></b>
              <div dir="ltr" className={`flex h-[52px] overflow-hidden rounded-[12px] border-[1.5px] bg-white ${errs && !phoneOk ? "border-[#C0392B]" : "border-line"}`}>
                <span className="flex items-center border-r border-line bg-brand-50 px-3.5 font-semibold text-ink-900">+964</span>
                <input value={phone} aria-invalid={errs && !phoneOk} inputMode="numeric" autoComplete="tel-national" placeholder="770 123 4567" maxLength={13}
                  onChange={(e) => setPhone(e.target.value.replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c))).replace(/^0/, "").replace(/[^\d\s]/g, ""))}
                  className="min-w-0 flex-1 px-3.5 text-base font-medium text-ink-900 outline-none" />
              </div>
              {errs && !phoneOk && <span role="alert" className="text-sm font-medium text-[#C0392B]">رقم غير صحيح. اكتب 10 أرقام تبدأ بـ 7، مثل 7701234567</span>}
            </label>
            <label className="flex flex-col gap-2">
              <b className="font-heading text-[15px] font-semibold text-ink-900">صف حالتك باختصار <span className="text-[13px] font-normal text-ink-500">(اختياري)</span></b>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500} placeholder="مثلاً: ألم في الضرس الخلفي منذ يومين"
                className="resize-y rounded-[12px] border-[1.5px] border-line bg-white px-4 py-3 text-base leading-[1.7] text-ink-900" />
            </label>
            <button type="submit" disabled={busy} className={`${primary} hidden self-start lg:block`}>
              {busy ? "جارٍ الإرسال…" : "تأكيد طلب الحجز"}
            </button>
          </form>
        )}

        {step < 4 && (
          <div className="hidden border-t border-line pt-6 lg:flex">
            <button type="button" onClick={() => go(step + 1)} disabled={cant} className={primary}>التالي ←</button>
          </div>
        )}
      </div>

      <aside aria-label="ملخص الحجز" className="sticky top-6 hidden overflow-hidden rounded-md border border-line bg-white shadow-[0_8px_28px_rgba(31,35,40,0.06)] lg:block">
        <div className="bg-brand-50 px-5 py-[18px] font-heading text-lg font-semibold text-ink-900">ملخص الحجز</div>
        {summaryRows(false)}
        <div className="px-5 py-4 text-[13px] leading-[1.6] text-ink-500">
          الحجز طلب مبدئي، ويُؤكَّد عبر واتساب. أوقات العمل: <span dir="ltr">3:00 PM – 8:00 PM</span>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white shadow-[0_-8px_28px_rgba(31,35,40,0.06)] lg:hidden">
        {sheet && <div className="max-h-[300px] overflow-y-auto px-4 pt-2">{summaryRows(true)}</div>}
        <div className="flex items-center gap-2.5 px-4 pt-2.5 pb-[max(18px,env(safe-area-inset-bottom))]">
          <button type="button" onClick={() => setSheet(!sheet)} aria-expanded={sheet} className="flex min-h-[52px] min-w-0 flex-1 flex-col items-start justify-center">
            <span className="text-xs text-ink-500">ملخص الحجز {sheet ? "▾" : "▴"}</span>
            <b className="max-w-full truncate font-heading text-sm font-semibold text-ink-900">
              {[docLabel, caseLabel, dayLabel].filter(Boolean).join(" · ") || "اختر الطبيب للبدء"}
            </b>
          </button>
          {step === 4 ? (
            <button type="submit" form="book" disabled={busy} className={`${primary} flex-none px-[22px]`}>{busy ? "جارٍ الإرسال…" : "تأكيد الحجز"}</button>
          ) : (
            <button type="button" onClick={() => go(step + 1)} disabled={cant} className={`${primary} flex-none px-[22px]`}>التالي ←</button>
          )}
        </div>
      </div>
    </div>
  );
}

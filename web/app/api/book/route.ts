import t from "@/messages/ar.json";
import { telegramAdmins } from "@/lib/site";

const doctors = [...[t.doctors.lead, ...t.doctors.team].map((d) => d.name), "أي طبيب متاح"];
const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

// Sends a booking request to the clinic owner's Telegram chat.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const doctor = s(b?.doctor, 60);
  const kase = s(b?.case, 140);
  const day = s(b?.day, 40);
  const time = s(b?.time, 40);
  const name = s(b?.name, 60);
  const phone = s(b?.phone, 20).replace(/\s/g, "");
  const note = s(b?.note, 500);

  if (!doctors.includes(doctor) || !kase || !day || !time || name.split(/\s+/).length < 2 || !/^7\d{9}$/.test(phone)) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const msg = `📅 طلب حجز جديد\n\nالاسم: ${name}\nالهاتف: +964${phone}\nالطبيب: ${doctor}\nالحالة: ${kase}\nالموعد: ${day} · ${time}\n\n${note || "—"}`;
  const sent = await Promise.all(
    telegramAdmins().map((chat_id) =>
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id,
          text: msg,
          reply_markup: { inline_keyboard: [[{ text: "💬 واتساب", url: `https://wa.me/964${phone}` }]] },
        }),
      }).then((r) => r.ok, () => false),
    ),
  );
  // Succeeds if any admin got it (e.g. one hasn't /start'ed the bot yet).
  const ok = sent.some(Boolean);

  return Response.json({ ok }, { status: ok ? 200 : 502 });
}

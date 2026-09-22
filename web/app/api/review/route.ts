import { put } from "@vercel/blob";
import t from "@/messages/ar.json";

const doctors = [t.doctors.lead, ...t.doctors.team].map((d) => d.name);
const cases = t.services.items.map((s) => s.t);

// Sends a patient review to the clinic owner's Telegram chat.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const doctor = String(body?.doctor ?? "");
  const kase = String(body?.case ?? "");
  const stars = Number(body?.stars);
  const name = String(body?.name ?? "").trim().slice(0, 40);
  const text = String(body?.text ?? "").trim().slice(0, 2000);

  if (!doctors.includes(doctor) || !cases.includes(kase) || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await put(
    `reviews/pending/${id}.json`,
    JSON.stringify({ id, name, doctor, case: kase, stars, text, date: new Date().toISOString() }),
    { access: "public", contentType: "application/json", addRandomSuffix: false },
  );

  const msg = `⭐ تقييم جديد\n\nالاسم: ${name || "—"}\nالطبيب: ${doctor}\nالحالة: ${kase}\nالتقييم: ${"★".repeat(stars)}${"☆".repeat(5 - stars)}\n\n${text || "—"}`;
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_OWNER_ID, text: msg,
      reply_markup: {
        inline_keyboard: [[
          { text: "✅ نشر", callback_data: `r:post:${id}` },
          { text: "🗑 حذف", callback_data: `r:del:${id}` },
        ]],
      },
    }),
  });

  return Response.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
}

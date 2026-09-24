import { deleteFiles, listFiles, readText, writeFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import t from "@/messages/ar.json";

const cases = t.services.items.map((s) => s.t);
const api = (method: string, body: object) =>
  fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

type Msg = {
  message_id: number;
  text?: string;
  chat: { id: number };
  from?: { id: number };
  sticker?: { file_id: string; is_animated?: boolean; is_video?: boolean };
  document?: { file_id: string; mime_type?: string };
  reply_to_message?: Msg;
};

// webp arrives as a sticker (Telegram's default for .webp) or as a file.
const webpId = (m?: Msg) =>
  m?.sticker && !m.sticker.is_animated && !m.sticker.is_video
    ? m.sticker.file_id
    : m?.document?.mime_type === "image/webp"
      ? m.document.file_id
      : undefined;

// Stateless flow: every step replies to the image, so callback_query.message.reply_to_message
// always carries the file. Buttons: "c:<case>" -> "s:<case>:before|after".
export async function POST(req: Request) {
  if (req.headers.get("x-telegram-bot-api-secret-token") !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response(null, { status: 401 });
  }
  const u = await req.json();
  const owner = String(process.env.TELEGRAM_OWNER_ID);

  if (u.message) {
    const m: Msg = u.message;
    if (String(m.from?.id) !== owner) return Response.json({});
    if (m.text?.startsWith("/list")) {
      const files = await listFiles("cases/");
      const idxs = [...new Set(files.map((f) => f.key.split("/")[1]))].filter((i) => cases[+i]);
      const sides = (i: string) =>
        ["before", "after"].filter((s) => files.some((f) => f.key === `cases/${i}/${s}.webp`)).map((s) => (s === "before" ? "قبل" : "بعد"));
      await api("sendMessage", {
        chat_id: m.chat.id,
        text: idxs.length ? idxs.map((i) => `• ${cases[+i]} (${sides(i).join(" + ")})`).join("\n") : "لا توجد حالات مرفوعة.",
        reply_markup: { inline_keyboard: idxs.map((i) => [{ text: `🗑 حذف ${cases[+i]}`, callback_data: `d:${i}` }]) },
      });
      return Response.json({});
    }
    if (!webpId(m)) {
      await api("sendMessage", { chat_id: m.chat.id, text: "أرسل صورة بصيغة webp فقط." });
      return Response.json({});
    }
    await api("sendMessage", {
      chat_id: m.chat.id,
      reply_to_message_id: m.message_id,
      text: "اختر الحالة:",
      reply_markup: { inline_keyboard: cases.map((c, i) => [{ text: c, callback_data: `c:${i}` }]) },
    });
    return Response.json({});
  }

  const q = u.callback_query;
  if (!q || String(q.from.id) !== owner) return Response.json({});
  const msg: Msg = q.message;
  const [kind, idx, side] = String(q.data).split(":");
  const edit = (text: string, reply_markup?: object) =>
    api("editMessageText", { chat_id: msg.chat.id, message_id: msg.message_id, text, reply_markup });

  if (kind === "r" && (idx === "post" || idx === "del") && /^[\w-]{36}$/.test(side)) {
    // Review moderation: idx = action, side = review id.
    const pending = `reviews/pending/${side}.json`;
    const review = await readText(pending);
    if (review && idx === "post") {
      await writeFile(`reviews/approved/${side}.json`, review, "application/json");
      revalidatePath("/", "layout");
    }
    if (review) await deleteFiles([pending]);
    await edit(`${msg.text ?? ""}\n\n${!review ? "⚠️ تمت معالجته سابقاً" : idx === "post" ? "✅ تم النشر" : "🗑 تم الحذف"}`);
  } else if (kind === "d" && cases[+idx]) {
    const files = await listFiles(`cases/${idx}/`);
    await deleteFiles(files.map((f) => f.key));
    revalidatePath("/", "layout");
    await edit(`${msg.text ?? ""}\n\n${files.length ? `🗑 تم حذف ${cases[+idx]}` : "⚠️ محذوفة سابقاً"}`);
  } else if (kind === "c" && cases[+idx]) {
    await edit(`${cases[+idx]} — قبل أم بعد؟`, {
      inline_keyboard: [[
        { text: "قبل", callback_data: `s:${idx}:before` },
        { text: "بعد", callback_data: `s:${idx}:after` },
      ]],
    });
  } else if (kind === "s" && cases[+idx] && (side === "before" || side === "after")) {
    const fileId = webpId(msg.reply_to_message);
    if (!fileId) {
      await edit("لم أجد الصورة، أعد إرسالها.");
    } else {
      const f = await (await api("getFile", { file_id: fileId })).json();
      const img = await fetch(`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${f.result.file_path}`);
      await writeFile(`cases/${idx}/${side}.webp`, await img.arrayBuffer(), "image/webp");
      revalidatePath("/");
      const files = await listFiles(`cases/${idx}/`);
      const other = side === "before" ? "after" : "before";
      const done = files.some((f) => f.key === `cases/${idx}/${other}.webp`);
      await edit(
        done
          ? `✅ تم رفع ${cases[+idx]} (قبل وبعد) — ظاهرة الآن في الموقع.`
          : `✅ تم رفع صورة "${side === "before" ? "قبل" : "بعد"}". أرسل صورة "${other === "before" ? "قبل" : "بعد"}" لنفس الحالة لتظهر في الموقع.`,
      );
    }
  }
  await api("answerCallbackQuery", { callback_query_id: q.id });
  return Response.json({});
}

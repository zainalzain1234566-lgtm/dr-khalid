import { deleteFiles, listFiles, readText, writeCasePair, writeFile } from "@/lib/storage";
import { telegramAdmins } from "@/lib/site";
import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
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
  photo?: { file_id: string; width: number; height: number }[];
  sticker?: { file_id: string; is_animated?: boolean; is_video?: boolean };
  document?: { file_id: string; mime_type?: string };
  reply_to_message?: Msg;
};

// Photos arrive in several sizes; WebP can arrive as a static sticker or a file.
const imageId = (m?: Msg) => {
  if (m?.photo?.length) {
    return m.photo.reduce((a, b) => a.width * a.height > b.width * b.height ? a : b).file_id;
  }
  if (m?.sticker && !m.sticker.is_animated && !m.sticker.is_video) return m.sticker.file_id;
  if (m?.document && ["image/webp", "image/jpeg"].includes(m.document.mime_type ?? "")) return m.document.file_id;
};

async function downloadImage(fileId: string) {
  const maxBytes = 20 * 1024 * 1024;
  const file = await api("getFile", { file_id: fileId });
  const f = await file.json();
  if (!file.ok || !f.ok || !f.result?.file_path || f.result.file_size > maxBytes) throw new Error("Invalid Telegram file");
  const img = await fetch(`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${f.result.file_path}`);
  if (!img.ok) throw new Error("Image download failed");
  const bytes = await img.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > maxBytes) throw new Error("Invalid image size");
  const header = new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 12));
  if (new TextDecoder().decode(header).startsWith("RIFF") && new TextDecoder().decode(header.slice(8)) === "WEBP") return bytes;
  if (header[0] !== 0xff || header[1] !== 0xd8 || header[2] !== 0xff) throw new Error("Expected JPEG or WebP");
  return bytes;
}

async function transformWebp(bytes: ArrayBuffer, trim?: { top?: number; bottom?: number }) {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.IMAGES) throw new Error("Images binding unavailable");
  const input = env.IMAGES.input(new Response(bytes).body!);
  const output = await (trim ? input.transform({ trim }) : input).output({ format: "image/webp" });
  const converted = output.response();
  if (!converted.ok) throw new Error("Image conversion failed");
  const result = await converted.arrayBuffer();
  if (!result.byteLength) throw new Error("Empty image conversion");
  return result;
}

async function downloadWebp(fileId: string) {
  const bytes = await downloadImage(fileId);
  // ponytail: existing WebP stays unchanged and consumes no transformation quota.
  if (new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF") return bytes;
  return transformWebp(bytes);
}

async function splitWebp(fileId: string) {
  const bytes = await downloadImage(fileId);
  const { env } = await getCloudflareContext({ async: true });
  if (!env.IMAGES) throw new Error("Images binding unavailable");
  const info = await env.IMAGES.info(new Response(bytes).body!);
  if (!("height" in info) || !Number.isInteger(info.height) || info.height < 2) throw new Error("Image too short to split");
  const midpoint = Math.floor(info.height / 2);
  const top = await transformWebp(bytes, { bottom: info.height - midpoint });
  const bottom = await transformWebp(bytes, { top: midpoint });
  return { top, bottom };
}

// Stateless flow: every step replies to the image, so callback_query.message.reply_to_message
// always carries the file. Combined uploads add "s:<case>:both" -> "b:<case>:top|bottom".
export async function POST(req: Request) {
  if (req.headers.get("x-telegram-bot-api-secret-token") !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response(null, { status: 401 });
  }
  const u = await req.json();
  const admins = telegramAdmins();

  if (u.message) {
    const m: Msg = u.message;
    if (!admins.includes(String(m.from?.id))) return Response.json({});
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
    if (!imageId(m)) {
      await api("sendMessage", { chat_id: m.chat.id, text: "أرسل صورة أو ملفاً بصيغة JPG أو WebP. تُحوّل صور JPG إلى WebP تلقائياً (الحد الأقصى 20 MB)." });
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
  if (!q || !admins.includes(String(q.from.id))) return Response.json({});
  const msg: Msg = q.message;
  const parts = String(q.data).split(":");
  const [kind, idx, side] = parts;
  const validCase = /^(0|[1-9]\d*)$/.test(idx) && !!cases[+idx];
  const edit = (text: string, reply_markup: object = { inline_keyboard: [] }) =>
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
  } else if (kind === "d" && validCase && parts.length === 2) {
    const files = await listFiles(`cases/${idx}/`);
    await deleteFiles(files.map((f) => f.key));
    revalidatePath("/", "layout");
    await edit(`${msg.text ?? ""}\n\n${files.length ? `🗑 تم حذف ${cases[+idx]}` : "⚠️ محذوفة سابقاً"}`);
  } else if (kind === "c" && validCase && parts.length === 2) {
    await edit(`${cases[+idx]} — قبل أم بعد؟`, {
      inline_keyboard: [[
        { text: "قبل", callback_data: `s:${idx}:before` },
        { text: "بعد", callback_data: `s:${idx}:after` },
      ], [{ text: "قبل وبعد في صورة واحدة", callback_data: `s:${idx}:both` }]],
    });
  } else if (kind === "s" && validCase && parts.length === 3 && side === "both") {
    await edit(`${cases[+idx]} — أين صورة قبل؟ سيتم تقسيم الصورة أفقياً من المنتصف إلى نصفين؛ للصور غير المتساوية أرسل قبل وبعد منفصلتين.`, {
      inline_keyboard: [[
        { text: "قبل بالأعلى", callback_data: `b:${idx}:top` },
        { text: "قبل بالأسفل", callback_data: `b:${idx}:bottom` },
      ]],
    });
  } else if (kind === "b" && validCase && parts.length === 3 && (side === "top" || side === "bottom")) {
    const fileId = imageId(msg.reply_to_message);
    if (!fileId) {
      await edit("لم أجد الصورة، أعد إرسالها.");
    } else {
      let result: Awaited<ReturnType<typeof writeCasePair>>;
      try {
        const { top, bottom } = await splitWebp(fileId);
        result = await writeCasePair(idx, side === "top" ? top : bottom, side === "top" ? bottom : top);
      } catch {
        await edit("⚠️ تعذر تقسيم الصورة أو رفعها. لم يتم تغيير الصور السابقة. جرّب لاحقاً أو أرسل قبل وبعد منفصلتين.");
        await api("answerCallbackQuery", { callback_query_id: q.id });
        return Response.json({});
      }
      revalidatePath("/", "layout");
      await edit(result === "saved"
        ? `✅ تم رفع ${cases[+idx]} (قبل وبعد) — ظاهرة الآن في الموقع.`
        : result === "restored"
          ? "⚠️ تعذر رفع الصورتين. تمت استعادة الصور السابقة. أعد المحاولة."
          : "⚠️ تم حفظ جزء من الصور وتعذرت استعادة الصور السابقة بالكامل. أعد إرسال الصورة المجمعة واختر نفس الحالة لإصلاحها.");
    }
  } else if (kind === "s" && validCase && parts.length === 3 && (side === "before" || side === "after")) {
    const fileId = imageId(msg.reply_to_message);
    if (!fileId) {
      await edit("لم أجد الصورة، أعد إرسالها.");
    } else {
      try {
        await writeFile(`cases/${idx}/${side}.webp`, await downloadWebp(fileId), "image/webp");
      } catch {
        await edit("⚠️ تعذر رفع الصورة أو تحويلها. جرّب لاحقاً أو أرسل صورة WebP بحجم لا يتجاوز 20 MB.");
        await api("answerCallbackQuery", { callback_query_id: q.id });
        return Response.json({});
      }
      revalidatePath("/", "layout");
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

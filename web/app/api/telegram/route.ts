import { deleteFiles, listCaseFiles, listFiles, readRecord, readText, writeCasePair, writeFile, writeRecord } from "@/lib/storage";
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
  // ponytail: one display size covers cards and zoom; no responsive-image storage needed.
  const resized = input.transform({ ...(trim ? { trim } : {}), width: 1920, height: 1920, fit: "scale-down" });
  const output = await resized.output({ format: "image/webp", quality: 85 });
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

type Upload = {
  id: string;
  idx: string;
  owner: number;
  chat: number;
  fileId: string;
  side: "before" | "after" | "top" | "bottom";
  secondFileId?: string;
  status: "draft" | "processing" | "failed" | "published" | "deleted";
  startedAt?: number;
  token?: string;
};
const uploadKey = (id: string) => `telegram/cases/${id}.json`;
const promptKey = (chat: number, message: number) => `telegram/replies/${chat}/${message}.json`;
const caseId = (m: Msg) => `${m.chat.id.toString(36)}_${m.message_id.toString(36)}`;
const validId = (id: string) => /^-?[a-z0-9]+_[a-z0-9]+$/.test(id);
const progress = "⏳ جارٍ تجهيز الصور ورفعها…";
const busy = "⏳ هذه الحالة قيد التجهيز بالفعل. انتظر رسالة النتيجة؛ يمكنك إعادة المحاولة بعد خمس دقائق إذا توقف الرفع.";

async function telegram(method: string, body: object) {
  const response = await api(method, body);
  const result = await response.json();
  if (method === "editMessageText" && result.description?.includes("message is not modified")) return;
  if (!response.ok || !result.ok) throw new Error(`Telegram ${method} failed`);
  return result.result;
}

async function askMissing(upload: Upload) {
  const missing = upload.side === "before" ? "بعد" : "قبل";
  const prompt = await telegram("sendMessage", {
    chat_id: upload.chat,
    text: `✅ استلمت صورة "${upload.side === "before" ? "قبل" : "بعد"}" — ${cases[+upload.idx]}. رد على هذه الرسالة بصورة "${missing}" لإكمال هذه الحالة.`,
    reply_markup: { force_reply: true, selective: true },
  });
  await writeRecord(promptKey(upload.chat, prompt.message_id), { id: upload.id }, null);
}

// Native R2 conditional writes coordinate Worker instances; no process-local locks.
async function processUpload(id: string, owner: number, chat: number, notify: (text: string, retry?: boolean) => Promise<unknown>, secondFileId?: string) {
  const key = uploadKey(id);
  const record = await readRecord<Upload>(key);
  if (!record || record.value.owner !== owner || record.value.chat !== chat) return notify("⚠️ لم أجد هذه الحالة. أعد إرسال الصورة.");
  const old = record.value;
  if (old.status === "published" || old.status === "deleted") return notify("✅ تمت معالجة هذه الحالة سابقاً. أرسل صورة جديدة لإنشاء حالة أخرى.");
  if (old.status === "processing" && Date.now() - (old.startedAt ?? 0) < 5 * 60_000) return notify(busy, true);
  const upload: Upload = { ...old, secondFileId: old.secondFileId ?? secondFileId, status: "processing", startedAt: Date.now(), token: crypto.randomUUID() };
  if ((upload.side === "before" || upload.side === "after") && !upload.secondFileId) return askMissing(old);
  if (!await writeRecord(key, upload, record.etag)) return notify(busy, true);
  const marker = `cases/${upload.idx}/${id}/published.json`;
  let result: "saved" | "restored" | "partial" | undefined;
  try {
    await notify(progress);
    if (await readText(marker) !== null) result = "saved"; // Recover a completed write whose final notification failed.
    else {
      let before: ArrayBuffer, after: ArrayBuffer;
      if (upload.side === "top" || upload.side === "bottom") {
        const halves = await splitWebp(upload.fileId);
        before = upload.side === "top" ? halves.top : halves.bottom;
        after = upload.side === "top" ? halves.bottom : halves.top;
      } else {
        const first = await downloadWebp(upload.fileId);
        const second = await downloadWebp(upload.secondFileId!);
        before = upload.side === "before" ? first : second;
        after = upload.side === "before" ? second : first;
      }
      // Fence slow conversions after lease takeover, then renew before the short R2 writes.
      const current = await readRecord<Upload>(key);
      if (!current || current.value.token !== upload.token) return notify(busy, true);
      upload.startedAt = Date.now();
      if (!await writeRecord(key, upload, current.etag)) return notify(busy, true);
      result = await writeCasePair(upload.idx, before, after, id);
    }
    revalidatePath("/", "layout");
  } catch {
    // Preserve file references for retry; older cases were never touched.
  }
  const current = await readRecord<Upload>(key);
  if (!current || current.value.token !== upload.token) return notify(busy, true);
  await writeRecord(key, { ...upload, status: result === "saved" ? "published" : "failed" }, current.etag);
  return notify(result === "saved"
    ? `✅ تم رفع ${cases[+upload.idx]} (قبل وبعد) — ظاهرة الآن في الموقع. الحالات السابقة محفوظة.`
    : result === "partial"
      ? "⚠️ تعذر إكمال الحفظ وتنظيف بعض الملفات. الحالة الجديدة غير منشورة والحالات السابقة محفوظة. أعد المحاولة."
      : "⚠️ تعذر تجهيز الصور أو رفعها. الحالات السابقة محفوظة. أعد المحاولة.", result !== "saved");
}

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
      const files = (await listCaseFiles()).filter((f) => cases[+f.idx] && f.published);
      if (!files.length) await telegram("sendMessage", { chat_id: m.chat.id, text: "لا توجد حالات مرفوعة." });
      // ponytail: chunk Telegram messages, not the case catalogue; add browsing only if it becomes unwieldy.
      for (let i = 0; i < files.length; i += 15) {
        const rows = files.slice(i, i + 15).map((f) => ({
          ...f,
          label: `${cases[+f.idx]} — ${new Date(f.version).toLocaleDateString("ar-IQ", { timeZone: "Asia/Baghdad" })} — ${f.id}`,
        }));
        await telegram("sendMessage", {
          chat_id: m.chat.id,
          text: rows.map((f) => `• ${f.label} (${[f.before && "قبل", f.after && "بعد"].filter(Boolean).join(" + ")})`).join("\n"),
          reply_markup: { inline_keyboard: rows.map((f) => [{ text: `🗑 حذف ${f.label}`, callback_data: f.id === "legacy" ? `d:${f.idx}` : `d:${f.idx}:${f.id}` }]) },
        });
      }
      // /list also recovers a draft if its prompt or Worker was interrupted.
      const pending = [];
      for (const f of await listFiles("telegram/cases/")) {
        const draft = (await readRecord<Upload>(f.key))?.value;
        if (draft && draft.owner === m.from?.id && draft.chat === m.chat.id && !["published", "deleted"].includes(draft.status)) pending.push(draft);
      }
      for (let i = 0; i < pending.length; i += 15) {
        await telegram("sendMessage", {
          chat_id: m.chat.id,
          text: "حالات غير مكتملة — اختر حالة لإكمالها أو إعادة المحاولة:",
          reply_markup: { inline_keyboard: pending.slice(i, i + 15).map((f) => [{ text: `${cases[+f.idx]} — ${f.id}`, callback_data: `u:${f.id}` }]) },
        });
      }
      return Response.json({});
    }
    const fileId = imageId(m);
    const reply = m.reply_to_message && await readRecord<{ id: string }>(promptKey(m.chat.id, m.reply_to_message.message_id));
    if (reply) {
      const notify = (text: string, retry = false) => telegram("sendMessage", {
        chat_id: m.chat.id, reply_to_message_id: m.message_id, text,
        reply_markup: { inline_keyboard: retry ? [[{ text: "إعادة المحاولة", callback_data: `u:${reply.value.id}` }]] : [] },
      });
      if (!fileId) await notify("⚠️ أرسل صورة JPG أو WebP بالرد على نفس رسالة طلب الصورة.");
      else {
        try {
          await processUpload(reply.value.id, m.from!.id, m.chat.id, notify, fileId);
        } catch {
          await notify("⚠️ تعذر إكمال الطلب. الحالات السابقة محفوظة. أعد المحاولة؛ إذا كان الرفع قيد التجهيز انتظر خمس دقائق.", true);
        }
      }
      return Response.json({});
    }
    if (!fileId) {
      await telegram("sendMessage", { chat_id: m.chat.id, text: "أرسل صورة أو ملفاً بصيغة JPG أو WebP. تُحوّل صور JPG إلى WebP تلقائياً (الحد الأقصى 20 MB)." });
      return Response.json({});
    }
    await telegram("sendMessage", {
      chat_id: m.chat.id,
      reply_to_message_id: m.message_id,
      text: "اختر نوع العلاج للحالة الجديدة:",
      reply_markup: { inline_keyboard: cases.map((c, i) => [{ text: c, callback_data: `c:${i}` }]) },
    });
    return Response.json({});
  }

  const q = u.callback_query;
  if (!q || !admins.includes(String(q.from?.id))) return Response.json({});
  // Stop Telegram's spinner before any storage, downloads, or transformations.
  await api("answerCallbackQuery", { callback_query_id: q.id });
  const msg: Msg | undefined = q.message;
  if (!msg?.chat) return Response.json({});
  const parts = String(q.data).split(":");
  const [kind, idx, side] = parts;
  const validCase = /^(0|[1-9]\d*)$/.test(idx) && !!cases[+idx];
  const edit = async (text: string, reply_markup: object = { inline_keyboard: [] }) => {
    try {
      return await telegram("editMessageText", { chat_id: msg.chat.id, message_id: msg.message_id, text, reply_markup });
    } catch {
      return telegram("sendMessage", { chat_id: msg.chat.id, reply_to_message_id: msg.reply_to_message?.message_id, text, reply_markup });
    }
  };
  const notify = (id: string) => (text: string, retry = false) => edit(text, {
    inline_keyboard: retry ? [[{ text: "إعادة المحاولة", callback_data: `u:${id}` }]] : [],
  });

  try {
    if (kind === "r" && parts.length === 3 && (idx === "post" || idx === "del") && /^[\w-]{36}$/.test(side)) {
      const pending = `reviews/pending/${side}.json`;
      const review = await readText(pending);
      if (review && idx === "post") {
        await writeFile(`reviews/approved/${side}.json`, review, "application/json");
        revalidatePath("/", "layout");
      }
      if (review) await deleteFiles([pending]);
      await edit(`${msg.text ?? ""}\n\n${!review ? "⚠️ تمت معالجته سابقاً" : idx === "post" ? "✅ تم النشر" : "🗑 تم الحذف"}`);
    } else if (kind === "u" && parts.length === 2 && validId(idx)) {
      await processUpload(idx, q.from.id, msg.chat.id, notify(idx));
    } else if (kind === "d" && validCase && (parts.length === 2 || (parts.length === 3 && validId(side)))) {
      const prefix = `cases/${idx}/${side ? `${side}/` : ""}`;
      if (side) {
        const record = await readRecord<Upload>(uploadKey(side));
        if (record && (record.value.idx !== idx || record.value.status === "processing")) {
          await edit("⚠️ هذه الحالة قيد التجهيز. أعد المحاولة لاحقاً.");
          return Response.json({});
        }
        if (record && !await writeRecord(uploadKey(side), { ...record.value, status: "deleted" }, record.etag)) return Response.json({});
        await deleteFiles([`${prefix}published.json`]);
        revalidatePath("/", "layout");
      }
      // Old d:<idx> keyboards target the legacy pair only, never the treatment prefix.
      await deleteFiles([`${prefix}before.webp`, `${prefix}after.webp`]);
      revalidatePath("/", "layout");
      await edit(`🗑 تم حذف الحالة المحددة — ${cases[+idx]}. الحالات الأخرى محفوظة.`);
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
    } else if (validCase && parts.length === 3 && ((kind === "b" && (side === "top" || side === "bottom")) || (kind === "s" && (side === "before" || side === "after")))) {
      const original = msg.reply_to_message;
      const fileId = imageId(original);
      if (!fileId || !original || original.from?.id !== q.from.id || original.chat.id !== msg.chat.id) {
        await edit("لم أجد صورتك، أعد إرسالها.");
      } else {
        const id = caseId(original);
        const upload: Upload = { id, idx, owner: q.from.id, chat: msg.chat.id, fileId, side, status: "draft" };
        await writeRecord(uploadKey(id), upload, null);
        const current = await readRecord<Upload>(uploadKey(id));
        if (!current || current.value.owner !== q.from.id || current.value.chat !== msg.chat.id) await edit("⚠️ أعد إرسال الصورة.");
        else if (kind === "s" && current.value.status === "draft" && (current.value.side === "before" || current.value.side === "after")) {
          await edit("✅ تم بدء حالة جديدة. رد على رسالة طلب الصورة لإكمالها؛ الحالات السابقة محفوظة.");
          await askMissing(current.value);
        } else await processUpload(id, q.from.id, msg.chat.id, notify(id));
      }
    }
  } catch {
    await edit("⚠️ تعذر إكمال الطلب. الحالات السابقة محفوظة. أعد المحاولة؛ إذا كان الرفع قيد التجهيز انتظر خمس دقائق.", {
      inline_keyboard: ["s", "b", "u"].includes(kind) ? [[{ text: "إعادة المحاولة", callback_data: String(q.data) }]] : [],
    });
  }
  return Response.json({});
}

// Run from web/: node scripts/check-telegram-upload.mjs
// Actual route, storage and case loader; mocked Telegram, Images and R2. No live data.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { webcrypto } from "node:crypto";

const compile = (path) => ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const routeCode = compile("../app/api/telegram/route.ts");
const storageCode = compile("../lib/storage.ts");
const casesCode = compile("../lib/cases.ts");
const filesCode = compile("../app/files/[...key]/route.ts");
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
const webp = Buffer.from("RIFF\0\0\0\0WEBPVP8 ");
const topWebp = Buffer.concat([webp, Buffer.from("top")]);
const bottomWebp = Buffer.concat([webp, Buffer.from("bottom")]);
const photo = { photo: [{ file_id: "large", width: 1200, height: 800 }, { file_id: "small", width: 120, height: 80 }] };
const jpgFile = { document: { file_id: "jpg", mime_type: "image/jpeg" } };
const webpFile = { document: { file_id: "webp", mime_type: "image/webp" } };
const sticker = { sticker: { file_id: "sticker" } };
const message = (image = jpgFile, id = 1, owner = 1, chat = 1) => ({ message_id: id, from: { id: owner }, chat: { id: chat }, ...image });
const beforeKey = "cases/0/1_1/before.webp", afterKey = "cases/0/1_1/after.webp";
const markerKey = "cases/0/1_1/published.json", stateKey = "telegram/cases/1_1.json";
const oldPair = {
  "cases/0/before.webp": { bytes: Buffer.from("old before"), contentType: "image/webp" },
  "cases/0/after.webp": { bytes: Buffer.from("old after"), contentType: "image/webp" },
};

function setup(options = {}) {
  const calls = [], writes = [], revalidations = [], conversions = [], events = [];
  const objects = new Map(Object.entries(options.previous ?? {}).map(([key, object]) => [key, { ...object, etag: object.etag ?? `initial-${key}`, version: object.version ?? 1 }]));
  let serial = 100, imagePuts = 0, infos = 0, lists = 0;
  const env = { FILES: {
    get: async (key) => {
      events.push(`get:${key}`);
      if (options.readError) throw new Error("R2 read failed");
      const object = objects.get(key);
      return object ? { key, etag: object.etag, uploaded: new Date(object.version), body: new Response(object.bytes).body,
        text: async () => object.bytes.toString(), httpMetadata: { contentType: object.contentType } } : null;
    },
    put: async (key, bytes, metadata) => {
      const current = objects.get(key), condition = metadata?.onlyIf;
      if (condition?.get("If-None-Match") === "*" && current) return null;
      if (condition?.has("If-Match")) {
        assert.match(condition.get("If-Match"), /^".+"$/, "R2 requires quoted HTTP ETags");
        if (`"${current?.etag}"` !== condition.get("If-Match")) return null;
      }
      if (key.startsWith("cases/")) {
        imagePuts++;
        if (options.failPuts?.includes(imagePuts)) throw new Error("R2 write failed");
      }
      writes.push([key, bytes, metadata?.httpMetadata?.contentType]);
      const object = { bytes: Buffer.from(bytes), contentType: metadata?.httpMetadata?.contentType, etag: String(++serial), version: serial };
      objects.set(key, object);
      events.push(`put:${key}`);
      return { key, etag: object.etag, uploaded: new Date(object.version) };
    },
    delete: async (keys) => {
      if (options.deleteError) throw new Error("R2 delete failed");
      for (const key of Array.isArray(keys) ? keys : [keys]) { objects.delete(key); events.push(`delete:${key}`); }
    },
    list: async ({ prefix, cursor }) => {
      lists++;
      const found = [...objects.entries()].filter(([key]) => key.startsWith(prefix));
      const start = Number(cursor ?? 0), size = options.pageSize ?? 1000;
      const page = found.slice(start, start + size);
      const truncated = start + size < found.length;
      return { objects: page.map(([key, value]) => ({ key, etag: value.etag, uploaded: new Date(value.version) })), truncated, cursor: truncated ? String(start + size) : undefined };
    },
  } };
  if (!options.noBinding) env.IMAGES = {
    info: async () => {
      infos++;
      if (options.infoError) throw new Error("Invalid image");
      return options.info ?? { width: 10, height: options.height ?? 8 };
    },
    input(stream) {
      let transform;
      return {
        transform(settings) { transform = settings; return this; },
        async output(settings) {
          const trim = transform?.trim;
          conversions.push({ settings, transform, trim, bytes: Buffer.from(await new Response(stream).arrayBuffer()) });
          events.push("convert");
          if (options.gate) await options.gate();
          if (options.conversionError || options.failConversion === conversions.length) throw new Error("Transformation quota exceeded");
          const bytes = options.emptyOutput ? Buffer.alloc(0) : trim ? trim.bottom !== undefined ? topWebp : bottomWebp : webp;
          return { response: () => new Response(bytes, { status: options.conversionStatus ?? 200 }) };
        },
      };
    },
  };
  const imports = {
    "@/lib/site": { telegramAdmins: () => ["1", "2"] },
    "next/cache": { revalidatePath: (...args) => revalidations.push(args) },
    "@opennextjs/cloudflare": { getCloudflareContext: () => ({ env }) },
    "@/messages/ar.json": { services: { items: [{ t: "حالة" }, { t: "علاج آخر" }] } },
  };
  const scope = {
    require: (name) => { assert.ok(imports[name], `Unexpected import: ${name}`); return imports[name]; },
    Response, Request, Headers, TextDecoder, Uint8Array, crypto: webcrypto,
    process: { env: { TELEGRAM_WEBHOOK_SECRET: "test", TELEGRAM_BOT_TOKEN: "test" } },
    fetch: async (url, init) => {
      if (url.includes("/file/bot")) { events.push("download"); return new Response(options.bytes ?? jpeg, { status: options.downloadStatus ?? 200 }); }
      const method = url.split("/").at(-1), body = JSON.parse(init.body);
      calls.push({ method, body }); events.push(method);
      if (method === "editMessageText" && options.editError) return Response.json({ ok: false, description: "message cannot be edited" }, { status: 400 });
      if (method === "getFile") return Response.json({ ok: !options.fileError, result: { file_path: "photo.jpg", file_size: options.fileSize ?? 4 } });
      return Response.json({ ok: true, result: { message_id: ++serial, chat: { id: body.chat_id } } });
    },
  };
  const load = (compiled) => {
    const loaded = { exports: {} };
    vm.runInNewContext(compiled, { ...scope, module: loaded, exports: loaded.exports });
    return loaded.exports;
  };
  const storage = imports["@/lib/storage"] = load(storageCode);
  const route = load(routeCode), loader = load(casesCode), files = load(filesCode);
  const post = (update, secret = "test") => route.POST(new Request("https://example.test/api/telegram", {
    method: "POST", headers: { "x-telegram-bot-api-secret-token": secret }, body: JSON.stringify(update),
  }));
  const callback = (data = "b:0:top", original = message(), owner = original?.from?.id ?? 1) => post({ callback_query: {
    id: `callback-${serial}`, from: { id: owner }, data,
    message: { message_id: 90, chat: original?.chat ?? { id: 1 }, reply_to_message: original },
  } });
  const imageWrites = () => writes.filter(([key]) => key.startsWith("cases/"));
  const status = () => JSON.parse(objects.get(stateKey).bytes).status;
  const visible = (language = "ar") => loader.allCases({ services: { items: [{ t: language === "ar" ? "حالة" : "Treatment" }, { t: "Other" }] }, cases: { items: [] } });
  const reply = async (image = jpgFile, owner = 1, id = 2, chat = 1, prompt) => {
    const key = prompt ?? [...objects.keys()].findLast((key) => key.startsWith(`telegram/replies/${chat}/`));
    return post({ message: { ...message(image, id, owner, chat), reply_to_message: { message_id: Number(key.split("/").at(-1).split(".")[0]), chat: { id: chat } } } });
  };
  return { options, calls, events, writes, objects, conversions, revalidations, post, callback, reply, storage, files, visible, imageWrites, status, infos: () => infos, lists: () => lists };
}
const lastText = (h) => h.calls.findLast((c) => ["editMessageText", "sendMessage"].includes(c.method)).body.text;
const json = (h, key = stateKey) => JSON.parse(h.objects.get(key).bytes);

for (const [image, fileId, bytes, converts] of [[photo, "large", jpeg, 2], [jpgFile, "jpg", jpeg, 2], [webpFile, "webp", webp, 0], [sticker, "sticker", webp, 0]]) {
  const h = setup({ bytes });
  await h.post({ message: message(image) });
  assert.ok(h.calls[0].body.reply_markup.inline_keyboard.length);
  await h.callback("s:0:before", message(image));
  assert.equal(h.imageWrites().length, 0); // First photo stays a private Telegram reference.
  assert.equal(h.calls.at(-1).body.reply_markup.force_reply, true);
  await h.reply(image);
  assert.equal(h.calls.find((c) => c.method === "getFile").body.file_id, fileId);
  assert.equal(h.conversions.length, converts);
  for (const c of h.conversions) {
    assert.equal(c.settings.quality, 85); assert.equal(c.settings.format, "image/webp");
    assert.equal(c.transform.width, 1920); assert.equal(c.transform.height, 1920); assert.equal(c.transform.fit, "scale-down");
    assert.deepEqual(c.bytes, jpeg);
  }
  assert.deepEqual(h.objects.get(beforeKey).bytes, webp);
  assert.deepEqual(h.objects.get(afterKey).bytes, webp);
  assert.ok(h.objects.has(markerKey)); assert.equal(h.status(), "published");
  assert.equal((await h.visible()).length, 1); assert.ok(lastText(h).startsWith("✅"));
  const count = h.imageWrites().length;
  await h.reply(image);
  assert.equal(h.imageWrites().length, count); // A completed prompt cannot replace images.
}
// After-first photos and replies to different pending prompts never mix patients.
{
  const h = setup();
  await h.callback("s:0:after");
  const prompt1 = [...h.objects.keys()].find((key) => key.startsWith("telegram/replies/"));
  await h.callback("s:0:before", message(jpgFile, 3));
  const prompt2 = [...h.objects.keys()].findLast((key) => key.startsWith("telegram/replies/"));
  await h.reply(jpgFile, 2, 4, 1, prompt1);
  assert.equal(h.imageWrites().length, 0); // Different authorized doctor cannot complete this case.
  await h.reply(jpgFile, 1, 4, 1, prompt2);
  assert.equal((await h.visible()).length, 1); assert.equal(h.status(), "draft");
  await h.reply(jpgFile, 1, 5, 1, prompt1);
  assert.equal((await h.visible()).length, 2); assert.equal(h.status(), "published");
  await h.post({ message: message(jpgFile, 6) });
  assert.ok(h.calls.at(-1).body.text.includes("الجديدة"));
  await h.post({ message: { ...message(jpgFile, 7, 1, 99), reply_to_message: { message_id: Number(prompt1.split("/").at(-1).split(".")[0]), chat: { id: 99 } } } });
  assert.equal((await h.visible()).length, 2); // Wrong chat cannot attach to the old case.
}
for (const image of [{ document: { file_id: "png", mime_type: "image/png" } }, { sticker: { file_id: "x", is_animated: true } }, { sticker: { file_id: "x", is_video: true } }]) {
  const h = setup(); await h.post({ message: message(image) });
  assert.equal(h.calls[0].body.reply_markup, undefined); assert.ok(lastText(h).includes("JPG"));
}
{
  const h = setup();
  assert.equal((await h.post({ message: message() }, "wrong")).status, 401);
  await h.callback("b:0:top", message(jpgFile, 1, 9)); assert.equal(h.calls.length, 0);
  await h.callback("b:0:top", message(jpgFile, 1, 2), 1); assert.equal(h.imageWrites().length, 0);
  await h.callback("c:0");
  assert.ok(h.calls.findLast((c) => c.method === "editMessageText").body.reply_markup.inline_keyboard.flat().some((b) => b.callback_data === "s:0:both"));
  await h.callback("s:0:both");
  const order = h.calls.at(-1).body;
  assert.deepEqual(order.reply_markup.inline_keyboard[0].map((b) => b.callback_data), ["b:0:top", "b:0:bottom"]);
  assert.ok(order.text.includes("المنتصف"));
}
for (const image of [jpgFile, webpFile, photo]) for (const side of ["top", "bottom"]) for (const height of [8, 9, 2, 3]) {
  const bytes = image === webpFile ? webp : jpeg, h = setup({ bytes, height });
  await h.callback(`b:0:${side}`, message(image));
  assert.equal(h.calls[0].method, "answerCallbackQuery");
  assert.equal(h.calls.filter((c) => c.method === "answerCallbackQuery").length, 1);
  assert.ok(h.events.indexOf("answerCallbackQuery") < h.events.indexOf("getFile"));
  assert.ok(h.calls[1].body.text.includes("جارٍ")); assert.deepEqual(h.calls[1].body.reply_markup.inline_keyboard, []);
  assert.equal(h.infos(), 1); assert.equal(h.conversions.length, 2);
  assert.equal(h.conversions[0].trim.bottom, height - Math.floor(height / 2));
  assert.equal(h.conversions[1].trim.top, Math.floor(height / 2));
  for (const c of h.conversions) { assert.deepEqual(c.bytes, bytes); assert.equal(c.settings.quality, 85); assert.equal(c.transform.fit, "scale-down"); }
  assert.deepEqual(h.objects.get(beforeKey).bytes, side === "top" ? topWebp : bottomWebp);
  assert.deepEqual(h.objects.get(afterKey).bytes, side === "top" ? bottomWebp : topWebp);
  assert.equal(h.revalidations[0][1], "layout"); assert.ok(lastText(h).startsWith("✅"));
  const count = h.imageWrites().length;
  await h.callback(`b:0:${side}`); assert.equal(h.imageWrites().length, count);
}
for (const options of [
  { height: 1 }, { height: 0 }, { height: 2.5 }, { info: { format: "image/svg+xml" } },
  { infoError: true }, { failConversion: 2 }, { conversionError: true }, { noBinding: true },
  { conversionStatus: 500 }, { emptyOutput: true }, { downloadStatus: 404 }, { fileError: true },
  { fileSize: 21 * 1024 * 1024 }, { bytes: Buffer.from("not image") }, { bytes: Buffer.alloc(0) },
  { bytes: Buffer.alloc(20 * 1024 * 1024 + 1) },
]) {
  const h = setup(options); await h.callback();
  assert.equal(h.imageWrites().length, 0); assert.equal(h.status(), "failed");
  assert.equal(h.revalidations.length, 0); assert.ok(lastText(h).includes("تعذر"));
  assert.equal(h.calls.at(-1).body.reply_markup.inline_keyboard[0][0].callback_data, "u:1_1");
}
// Failure releases the claim; retry uses the same case and stored image references.
for (const side of ["top", "before"]) {
  const h = setup({ conversionError: true, previous: oldPair });
  await h.callback(side === "top" ? "b:0:top" : "s:0:before");
  if (side === "before") await h.reply();
  assert.equal(h.status(), "failed"); h.options.conversionError = false;
  await h.callback("u:1_1"); assert.equal(h.status(), "published");
  for (const [key, value] of Object.entries(oldPair)) assert.deepEqual(h.objects.get(key).bytes, value.bytes);
}
// Pair rollback tests retain existing regression coverage, including restoration failures.
const newPair = { [beforeKey]: oldPair["cases/0/before.webp"], [afterKey]: oldPair["cases/0/after.webp"] };
for (const prior of [newPair, {}, { [beforeKey]: newPair[beforeKey] }]) for (const failure of [1, 2, 3]) {
  const h = setup({ previous: prior, failPuts: [failure] });
  assert.equal(await h.storage.writeCasePair("0", jpeg, jpeg, "1_1"), "restored");
  assert.deepEqual([...h.objects.keys()].sort(), Object.keys(prior).sort());
  for (const [key, value] of Object.entries(prior)) assert.deepEqual(h.objects.get(key).bytes, value.bytes);
}
for (const options of [{ previous: newPair, failPuts: [2, 3] }, { failPuts: [2], deleteError: true }]) {
  const h = setup(options); await h.callback();
  assert.ok(lastText(h).includes("تنظيف")); assert.equal((await h.visible()).length, 0);
  assert.equal(h.revalidations.length, 1); assert.equal(h.status(), "failed");
}
{
  const h = setup({ readError: true });
  await assert.rejects(h.storage.writeCasePair("0", jpeg, jpeg, "1_1")); assert.equal(h.imageWrites().length, 0);
  await h.callback(); assert.ok(lastText(h).includes("تعذر"));
  assert.equal(h.calls.at(-1).body.reply_markup.inline_keyboard[0][0].callback_data, "b:0:top");
}
{
  const h = setup({ editError: true }); await h.callback();
  assert.equal(h.status(), "published"); assert.ok(lastText(h).startsWith("✅"));
  assert.equal(h.calls.find((c) => c.method === "sendMessage").body.reply_to_message_id, 1);
}
// Delayed native processing: spinner/progress happen first and concurrent clicks do no extra work.
{
  let release, entered;
  const started = new Promise((resolve) => { entered = resolve; });
  const gate = new Promise((resolve) => { release = resolve; });
  const h = setup({ gate: () => { entered(); return gate; } });
  const pending = h.callback(); await started;
  assert.equal(h.calls[0].method, "answerCallbackQuery"); assert.ok(h.calls[1].body.text.includes("جارٍ"));
  assert.equal((await h.visible()).length, 0);
  await h.callback("b:0:bottom"); assert.ok(lastText(h).includes("بالفعل"));
  assert.equal(h.conversions.length, 1); release(); await pending;
  assert.equal(h.status(), "published"); assert.equal((await h.visible()).length, 1);
}
// Conditional creation also handles two callbacks arriving before either reads the record.
{
  const h = setup(); await Promise.all([h.callback(), h.callback()]);
  assert.equal(h.conversions.length, 2); assert.equal(h.imageWrites().length, 3);
}
// A five-minute abandoned claim can retry; an old worker is fenced after takeover.
{
  const h = setup(); await h.callback("s:0:before");
  const state = json(h);
  await h.storage.writeRecord(stateKey, { ...state, side: "top", status: "processing", startedAt: Date.now() - 301_000, token: "abandoned" }, h.objects.get(stateKey).etag);
  await h.post({ message: message({ text: "/list" }) });
  assert.equal(h.calls.at(-1).body.reply_markup.inline_keyboard[0][0].callback_data, "u:1_1");
  await h.callback("u:1_1"); assert.equal(h.status(), "published");
}
// Publication survives interruption between marker write and private state completion.
{
  const h = setup(); await h.callback();
  await h.storage.writeRecord(stateKey, { ...json(h), status: "processing", startedAt: Date.now() - 301_000 }, h.objects.get(stateKey).etag);
  const count = h.imageWrites().length; await h.callback("u:1_1");
  assert.equal(h.status(), "published"); assert.equal(h.imageWrites().length, count);
}
{
  let release, entered;
  const started = new Promise((resolve) => { entered = resolve; }), gate = new Promise((resolve) => { release = resolve; });
  const h = setup({ gate: () => { entered(); return gate; } });
  const pending = h.callback(); await started;
  await h.storage.writeRecord(stateKey, { ...json(h), token: "another-worker" }, h.objects.get(stateKey).etag);
  release(); await pending; assert.equal(h.imageWrites().length, 0);
}
// Newest-first cases coexist with legacy pairs, across R2 pages and both dictionaries.
{
  const h = setup({ previous: oldPair, pageSize: 2 });
  await h.callback(); await h.callback("b:0:bottom", message(jpgFile, 3));
  for (const language of ["ar", "en"]) {
    const visible = await h.visible(language);
    assert.equal(visible.length, 3); assert.ok(visible[0].before.includes("1_3/"));
    assert.ok(visible[2].before.endsWith("cases/0/before.webp"));
    assert.equal(new Set(visible.map((c) => c.before)).size, 3);
    assert.equal(visible.filter((c) => c.tag === (language === "ar" ? "حالة" : "Treatment")).length, 3);
  }
  assert.ok(h.lists() > 1);
  await h.post({ message: message({ text: "/list" }) });
  const buttons = h.calls.at(-1).body.reply_markup.inline_keyboard.flat();
  assert.equal(buttons.length, 3); assert.ok(buttons.some((b) => b.callback_data === "d:0:1_1"));
  await h.callback("d:0"); assert.equal((await h.visible()).length, 2); // Old delete button never deletes new cases.
  await h.callback("d:0:1_1"); assert.equal((await h.visible()).length, 1); assert.equal(h.status(), "deleted");
  await h.callback("u:1_1"); assert.equal((await h.visible()).length, 1);
}
// Public serving rejects private state, markers, traversal and incomplete new pairs.
{
  const h = setup({ previous: { [beforeKey]: { bytes: webp, contentType: "image/webp" }, ...oldPair } });
  const get = (path) => h.files.GET(new Request("https://example.test/files"), { params: Promise.resolve({ key: path.split("/") }) });
  for (const path of ["1/telegram/cases/1_1.json", "1/cases/0/1_1/published.json", "1/cases/../before.webp", `1/${beforeKey}`]) assert.equal((await get(path)).status, 404);
  assert.equal((await get("1/cases/0/before.webp")).status, 200);
  await h.callback(); assert.equal((await get(`1/${beforeKey}`)).status, 200);
}
{
  const h = setup(); await h.callback("b:0:top", null);
  assert.ok(lastText(h).includes("لم أجد")); assert.equal(h.writes.length, 0);
}
for (const data of ["b:0:left", "b:-1:top", "b:999:top", "b:00:top", "b:0:top:extra", "b:../:top", "s:0:both:extra", "u:../", "d:0:../", "d:0:1_1:extra"]) {
  const h = setup(); await h.callback(data);
  assert.equal(h.writes.length, 0); assert.equal(h.conversions.length, 0); assert.equal(h.calls[0].method, "answerCallbackQuery");
}
console.log("Telegram upload checks passed (mocked, no live writes).");

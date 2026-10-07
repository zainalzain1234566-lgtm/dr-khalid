// Run from web/: node scripts/check-telegram-upload.mjs
// All Telegram, Images, and R2 calls are mocked; this never touches live data.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../app/api/telegram/route.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const storageCode = ts.transpileModule(readFileSync(new URL("../lib/storage.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
const webp = Buffer.from("RIFF\0\0\0\0WEBPVP8 ");
const topWebp = Buffer.concat([webp, Buffer.from("top")]);
const bottomWebp = Buffer.concat([webp, Buffer.from("bottom")]);
const beforeKey = "cases/0/before.webp", afterKey = "cases/0/after.webp";
const photo = { photo: [
  { file_id: "large", width: 1200, height: 800 },
  { file_id: "small", width: 120, height: 80 },
] };
const jpgFile = { document: { file_id: "jpg", mime_type: "image/jpeg" } };
const webpFile = { document: { file_id: "webp", mime_type: "image/webp" } };
const sticker = { sticker: { file_id: "sticker" } };

async function run(image, options = {}) {
  const calls = [], writes = [], revalidations = [], conversions = [];
  const objects = new Map(Object.entries(options.previous ?? {}));
  let reads = 0, puts = 0, deletes = 0, infos = 0;
  const env = { FILES: {
    get: async (key) => {
      reads++;
      if (options.readError) throw new Error("Snapshot failed");
      const object = objects.get(key);
      return object ? { body: new Response(object.bytes).body, httpMetadata: { contentType: object.contentType } } : null;
    },
    put: async (key, bytes, metadata) => {
      puts++;
      writes.push([key, bytes, metadata?.httpMetadata?.contentType]);
      if (options.failPuts?.includes(puts)) throw new Error("R2 write failed");
      objects.set(key, { bytes: Buffer.from(bytes), contentType: metadata?.httpMetadata?.contentType });
    },
    delete: async (keys) => {
      deletes++;
      if (options.deleteError) throw new Error("R2 delete failed");
      for (const key of Array.isArray(keys) ? keys : [keys]) objects.delete(key);
    },
    list: async () => ({ objects: [...objects.keys()].map((key) => ({ key, uploaded: new Date() })) }),
  } };
  if (!options.noBinding) env.IMAGES = {
    info: async () => {
      infos++;
      if (options.infoError) throw new Error("Invalid image");
      return options.info ?? { width: 10, height: options.height ?? 8 };
    },
    input(stream) {
      let trim;
      return {
        transform(settings) { trim = settings.trim; return this; },
        async output(settings) {
          conversions.push({ settings, trim, bytes: Buffer.from(await new Response(stream).arrayBuffer()) });
          if (options.conversionError || options.failConversion === conversions.length) throw new Error("Transformation quota exceeded");
          const bytes = options.emptyOutput ? Buffer.alloc(0) : trim ? trim.bottom !== undefined ? topWebp : bottomWebp : webp;
          return { response: () => new Response(bytes, { status: options.conversionStatus ?? 200 }) };
        },
      };
    },
  };
  const imports = {
    "@/lib/site": { telegramAdmins: () => ["1"] },
    "next/cache": { revalidatePath: (...args) => revalidations.push(args) },
    "@opennextjs/cloudflare": { getCloudflareContext: async () => ({ env }) },
    "@/messages/ar.json": { services: { items: [{ t: "حالة" }] } },
  };
  const scope = {
    require: (name) => {
      assert.ok(imports[name], `Unexpected import: ${name}`);
      return imports[name];
    },
    Response, TextDecoder, Uint8Array,
    process: { env: { TELEGRAM_WEBHOOK_SECRET: "test", TELEGRAM_BOT_TOKEN: "test" } },
    fetch: async (url, init) => {
      if (url.includes("/file/bot")) return new Response(options.bytes ?? jpeg, { status: options.downloadStatus ?? 200 });
      const method = url.split("/").at(-1), body = JSON.parse(init.body);
      calls.push({ method, body });
      return Response.json(method === "getFile" ? {
        ok: !options.fileError,
        result: { file_path: "photo.jpg", file_size: options.fileSize ?? 4 },
      } : { ok: true });
    },
  };
  const load = (compiled) => {
    const loaded = { exports: {} };
    vm.runInNewContext(compiled, { ...scope, module: loaded, exports: loaded.exports });
    return loaded.exports;
  };
  imports["@/lib/storage"] = load(storageCode);
  const route = load(code);
  const message = { message_id: 1, chat: { id: 1 }, from: { id: options.user ?? 1 }, ...image };
  const update = options.message ? { message } : { callback_query: {
    id: "callback", from: message.from, data: options.data ?? "s:0:before",
    message: { message_id: 2, chat: message.chat, reply_to_message: options.missingImage ? undefined : message },
  } };
  const response = await route.POST(new Request("https://example.test/api/telegram", {
    method: "POST", headers: { "x-telegram-bot-api-secret-token": options.secret ?? "test" }, body: JSON.stringify(update),
  }));
  return { calls, writes, revalidations, conversions, response, objects, reads, puts, deletes, infos };
}

for (const [image, fileId, bytes, converts] of [
  [photo, "large", jpeg, 1], [jpgFile, "jpg", jpeg, 1],
  [webpFile, "webp", webp, 0], [sticker, "sticker", webp, 0],
]) {
  const result = await run(image, { bytes });
  assert.equal(result.calls.find((c) => c.method === "getFile").body.file_id, fileId);
  assert.equal(result.conversions.length, converts);
  if (converts) {
    assert.equal(result.conversions[0].settings.format, "image/webp");
    assert.deepEqual(result.conversions[0].bytes, jpeg);
  }
  assert.equal(result.writes.length, 1);
  assert.equal(result.writes[0][0], "cases/0/before.webp");
  assert.deepEqual(Buffer.from(result.writes[0][1]), webp);
  assert.equal(result.writes[0][2], "image/webp");
  assert.equal(result.revalidations[0][1], "layout");
  assert.equal(result.calls.at(-1).method, "answerCallbackQuery");
  const initial = await run(image, { message: true });
  assert.ok(initial.calls[0].body.reply_markup.inline_keyboard.length);
  assert.equal(initial.conversions.length, 0);
}
for (const options of [
  { conversionError: true }, { conversionStatus: 500 }, { noBinding: true },
  { downloadStatus: 404 }, { fileError: true }, { fileSize: 21 * 1024 * 1024 },
  { bytes: Buffer.from("not an image") }, { bytes: Buffer.alloc(0) },
  { bytes: Buffer.alloc(20 * 1024 * 1024 + 1) },
]) {
  const result = await run(jpgFile, options);
  assert.equal(result.writes.length, 0);
  assert.equal(result.revalidations.length, 0);
  assert.ok(result.calls.find((c) => c.method === "editMessageText").body.text.includes("تعذر"));
  assert.equal(result.calls.at(-1).method, "answerCallbackQuery");
}
for (const image of [
  { document: { file_id: "png", mime_type: "image/png" } },
  { sticker: { file_id: "animated", is_animated: true } },
  { sticker: { file_id: "video", is_video: true } },
]) {
  const result = await run(image, { message: true });
  assert.equal(result.calls[0].body.reply_markup, undefined);
  assert.ok(result.calls[0].body.text.includes("JPG"));
}
assert.equal((await run(jpgFile, { secret: "wrong" })).response.status, 401);
assert.equal((await run(jpgFile, { user: 2 })).calls.length, 0);

const menu = await run(jpgFile, { data: "c:0" });
assert.ok(menu.calls[0].body.reply_markup.inline_keyboard.flat().some((b) => b.callback_data === "s:0:both"));
const order = await run(jpgFile, { data: "s:0:both" });
assert.deepEqual(order.calls[0].body.reply_markup.inline_keyboard[0].map((b) => b.callback_data), ["b:0:top", "b:0:bottom"]);
assert.ok(order.calls[0].body.text.includes("المنتصف"));
assert.equal(order.writes.length, 0);

for (const image of [jpgFile, webpFile, photo]) {
  for (const side of ["top", "bottom"]) {
    for (const height of [8, 9, 2, 3]) {
      const bytes = image === webpFile ? webp : jpeg;
      const result = await run(image, { data: `b:0:${side}`, height, bytes });
      assert.equal(result.infos, 1);
      assert.equal(result.conversions.length, 2);
      assert.equal(result.conversions[0].trim.bottom, height - Math.floor(height / 2));
      assert.equal(result.conversions[1].trim.top, Math.floor(height / 2));
      for (const conversion of result.conversions) {
        assert.deepEqual(conversion.bytes, bytes); // Both crops start from original, not an encoded intermediate.
        assert.equal(conversion.settings.format, "image/webp");
      }
      assert.deepEqual(result.objects.get(beforeKey).bytes, side === "top" ? topWebp : bottomWebp);
      assert.deepEqual(result.objects.get(afterKey).bytes, side === "top" ? bottomWebp : topWebp);
      assert.equal(result.puts, 2);
      assert.equal(result.revalidations[0][1], "layout");
      const edit = result.calls.find((c) => c.method === "editMessageText").body;
      assert.ok(edit.text.startsWith("✅"));
      assert.deepEqual(edit.reply_markup.inline_keyboard, []);
    }
  }
}
for (const options of [
  { height: 1 }, { height: 0 }, { height: 2.5 }, { info: { format: "image/svg+xml" } },
  { infoError: true }, { failConversion: 2 }, { conversionError: true }, { noBinding: true },
  { conversionStatus: 500 }, { emptyOutput: true }, { readError: true },
]) {
  const result = await run(jpgFile, { data: "b:0:top", ...options });
  assert.equal(result.puts, 0);
  assert.equal(result.revalidations.length, 0);
  assert.ok(result.calls.find((c) => c.method === "editMessageText").body.text.includes("تعذر"));
  assert.equal(result.calls.at(-1).method, "answerCallbackQuery");
}
const previous = {
  [beforeKey]: { bytes: Buffer.from("previous before"), contentType: "image/webp" },
  [afterKey]: { bytes: Buffer.from("previous after"), contentType: "image/webp" },
};
for (const prior of [previous, {}, { [beforeKey]: previous[beforeKey] }]) {
  for (const failure of [1, 2]) {
    const result = await run(jpgFile, { data: "b:0:top", previous: prior, failPuts: [failure] });
    assert.deepEqual(Object.fromEntries(result.objects), prior);
    assert.equal(result.revalidations.length, 1);
    assert.ok(result.calls.find((c) => c.method === "editMessageText").body.text.includes("استعادة"));
  }
}
for (const options of [
  { previous, failPuts: [2, 3] },
  { failPuts: [2], deleteError: true },
]) {
  const result = await run(jpgFile, { data: "b:0:top", ...options });
  assert.ok(result.calls.find((c) => c.method === "editMessageText").body.text.includes("جزء"));
  assert.equal(result.revalidations.length, 1);
  assert.equal(result.calls.at(-1).method, "answerCallbackQuery");
}
const missing = await run(jpgFile, { data: "b:0:top", missingImage: true });
assert.ok(missing.calls[0].body.text.includes("لم أجد"));
assert.equal(missing.reads + missing.puts + missing.conversions.length, 0);
for (const data of ["b:0:left", "b:-1:top", "b:999:top", "b:00:top", "b:0:top:extra", "b:../:top", "s:0:both:extra"]) {
  const result = await run(jpgFile, { data });
  assert.equal(result.reads + result.puts + result.conversions.length, 0);
  assert.equal(result.calls.at(-1).method, "answerCallbackQuery");
}
console.log("Telegram upload checks passed (mocked, no live writes).");

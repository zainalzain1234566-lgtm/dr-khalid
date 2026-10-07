import { getCloudflareContext } from "@opennextjs/cloudflare";

// Site data (reviews, uploaded case photos) lives in the R2 bucket bound as FILES (wrangler.jsonc).
const bucket = async () => (await getCloudflareContext({ async: true })).env.FILES;

export type StoredFile = { key: string; version: number };

export async function listFiles(prefix: string): Promise<StoredFile[]> {
  const files = await bucket();
  const result: StoredFile[] = [];
  let cursor: string | undefined;
  do {
    const page = await files.list({ prefix, cursor });
    result.push(...page.objects.map((o) => ({ key: o.key, version: o.uploaded.getTime() })));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return result;
}

export async function readRecord<T>(key: string): Promise<{ value: T; etag: string } | null> {
  const object = await (await bucket()).get(key);
  return object ? { value: JSON.parse(await object.text()) as T, etag: object.etag } : null;
}

export async function writeRecord(key: string, value: object, etag: string | null) {
  return !!await (await bucket()).put(key, JSON.stringify(value), {
    httpMetadata: { contentType: "application/json" },
    onlyIf: new Headers(etag ? { "If-Match": `"${etag}"` } : { "If-None-Match": "*" }),
  });
}

export type CaseFiles = { idx: string; id: string; before?: StoredFile; after?: StoredFile; version: number; published: boolean };

export async function listCaseFiles(): Promise<CaseFiles[]> {
  const grouped = new Map<string, CaseFiles>();
  for (const file of await listFiles("cases/")) {
    const match = /^cases\/(0|[1-9]\d*)\/(?:(-?[a-z0-9]+_[a-z0-9]+)\/)?(before\.webp|after\.webp|published\.json)$/.exec(file.key);
    if (!match) continue;
    const [, idx, caseId, name] = match;
    const id = caseId ?? "legacy", key = `${idx}/${id}`;
    const item = grouped.get(key) ?? { idx, id, version: 0, published: !caseId };
    if (name === "published.json") item.published = true;
    else item[name === "before.webp" ? "before" : "after"] = file;
    item.version = Math.max(item.version, file.version);
    grouped.set(key, item);
  }
  return [...grouped.values()].sort((a, b) => b.version - a.version);
}

export async function readText(key: string): Promise<string | null> {
  return (await (await bucket()).get(key))?.text() ?? null;
}

export async function writeFile(key: string, body: string | ArrayBuffer, contentType: string) {
  await (await bucket()).put(key, body, { httpMetadata: { contentType } });
}

export async function writeCasePair(idx: string, before: ArrayBuffer, after: ArrayBuffer, id?: string) {
  const files = await bucket();
  const prefix = `cases/${idx}/${id ? `${id}/` : ""}`;
  const keys = [`${prefix}before.webp`, `${prefix}after.webp`, ...(id ? [`${prefix}published.json`] : [])];
  const previous = await Promise.all(keys.map(async (key) => {
    const object = await files.get(key);
    return object && { body: await new Response(object.body).arrayBuffer(), httpMetadata: object.httpMetadata };
  }));
  // ponytail: a marker hides incomplete new pairs; callers claim each case before writing.
  try {
    await files.put(keys[0], before, { httpMetadata: { contentType: "image/webp" } });
    await files.put(keys[1], after, { httpMetadata: { contentType: "image/webp" } });
    if (id) await files.put(keys[2], "{}", { httpMetadata: { contentType: "application/json" } });
    return "saved";
  } catch {
    const restored = await Promise.allSettled(keys.map((key, i) => {
      const old = previous[i];
      return old ? files.put(key, old.body, { httpMetadata: old.httpMetadata }) : files.delete(key);
    }));
    return restored.every((result) => result.status === "fulfilled") ? "restored" : "partial";
  }
}

export async function deleteFiles(keys: string[]) {
  if (keys.length) await (await bucket()).delete(keys);
}

// Public URL for an uploaded photo. The version in the path busts caches when a photo is replaced.
export const fileUrl = (f: StoredFile) => `/files/${f.version}/${f.key}`;

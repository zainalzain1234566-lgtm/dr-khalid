import { getCloudflareContext } from "@opennextjs/cloudflare";

// Site data (reviews, uploaded case photos) lives in the R2 bucket bound as FILES (wrangler.jsonc).
const bucket = async () => (await getCloudflareContext({ async: true })).env.FILES;

export type StoredFile = { key: string; version: number };

export async function listFiles(prefix: string): Promise<StoredFile[]> {
  const { objects } = await (await bucket()).list({ prefix });
  return objects.map((o) => ({ key: o.key, version: o.uploaded.getTime() }));
}

export async function readText(key: string): Promise<string | null> {
  return (await (await bucket()).get(key))?.text() ?? null;
}

export async function writeFile(key: string, body: string | ArrayBuffer, contentType: string) {
  await (await bucket()).put(key, body, { httpMetadata: { contentType } });
}

export async function writeCasePair(idx: string, before: ArrayBuffer, after: ArrayBuffer) {
  const files = await bucket();
  const keys = [`cases/${idx}/before.webp`, `cases/${idx}/after.webp`];
  const previous = await Promise.all(keys.map(async (key) => {
    const object = await files.get(key);
    return object && { body: await new Response(object.body).arrayBuffer(), httpMetadata: object.httpMetadata };
  }));
  // ponytail: snapshots recover failed writes; a manifest is needed for atomic concurrent pair updates.
  try {
    await files.put(keys[0], before, { httpMetadata: { contentType: "image/webp" } });
    await files.put(keys[1], after, { httpMetadata: { contentType: "image/webp" } });
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

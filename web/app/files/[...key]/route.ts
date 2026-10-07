import { getCloudflareContext } from "@opennextjs/cloudflare";

// Serves legacy and individual case photos; publication markers are private.
// Only cases/ is public; pending reviews stay private.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const [, ...rest] = (await params).key;
  const key = rest.join("/");
  const match = /^cases\/(0|[1-9]\d*)\/(?:(-?[a-z0-9]+_[a-z0-9]+)\/)?(before|after)\.webp$/.exec(key);
  if (!match) return new Response(null, { status: 404 });
  const files = getCloudflareContext().env.FILES;
  if (match[2] && !await files.get(`cases/${match[1]}/${match[2]}/published.json`)) return new Response(null, { status: 404 });
  const obj = await files.get(key);
  if (!obj) return new Response(null, { status: 404 });
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType ?? "image/webp",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

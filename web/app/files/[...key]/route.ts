import { getCloudflareContext } from "@opennextjs/cloudflare";

// Serves uploaded case photos from R2: /files/<version>/cases/<idx>/<side>.webp
// Only cases/ is public; pending reviews stay private.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const [, ...rest] = (await params).key;
  const key = rest.join("/");
  if (!key.startsWith("cases/")) return new Response(null, { status: 404 });
  const obj = await getCloudflareContext().env.FILES.get(key);
  if (!obj) return new Response(null, { status: 404 });
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType ?? "image/webp",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

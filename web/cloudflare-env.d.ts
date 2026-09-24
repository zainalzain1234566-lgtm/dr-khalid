// Our own bindings from wrangler.jsonc (the adapter declares its cache bindings itself).
// Minimal R2 types for what lib/storage.ts and app/files use. Not `wrangler types`: its runtime
// types replace the global Request/Response types the API routes rely on.
interface R2Object {
  key: string;
  uploaded: Date;
  httpMetadata?: { contentType?: string };
}
interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  text(): Promise<string>;
}
interface R2Bucket {
  list(options: { prefix: string }): Promise<{ objects: R2Object[] }>;
  get(key: string): Promise<R2ObjectBody | null>;
  put(key: string, value: string | ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  delete(keys: string | string[]): Promise<void>;
}
interface CloudflareEnv {
  FILES: R2Bucket;
}

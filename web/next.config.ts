import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {};

export default nextConfig;

// Gives `next dev` access to the Cloudflare bindings (R2 etc.) from wrangler.jsonc.
initOpenNextCloudflareForDev();

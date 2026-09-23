import { list } from "@vercel/blob";
import type { Messages } from "@/lib/i18n";

export type Case = { t: string; tag: string; before: string; after: string };

// Cases uploaded by the owner via the Telegram bot (cases/<service idx>/{before,after}.webp) first,
// then the static ones from messages. A case is shown only when both photos exist.
export async function allCases(t: Messages): Promise<Case[]> {
  const { blobs } = await list({ prefix: "cases/" }).catch(() => ({ blobs: [] }));
  const url = (i: number, side: string) => blobs.find((b) => b.pathname === `cases/${i}/${side}.webp`)?.url;
  const uploaded = t.services.items.flatMap((s, i) => {
    const before = url(i, "before");
    const after = url(i, "after");
    return before && after ? [{ t: s.t, tag: s.t, before, after }] : [];
  });
  const fixed = t.cases.items.flatMap((i) => (i.before && i.after ? [{ ...i, before: i.before, after: i.after }] : []));
  return [...uploaded, ...fixed];
}

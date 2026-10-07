import { fileUrl, listCaseFiles } from "@/lib/storage";
import type { Messages } from "@/lib/i18n";

export type Case = { t: string; tag: string; before: string; after: string };

// New and legacy uploads precede static cases. New pairs need their publication marker.
export async function allCases(t: Messages): Promise<Case[]> {
  const files = await listCaseFiles().catch(() => []);
  const uploaded = files.flatMap((f) => {
    const s = t.services.items[+f.idx];
    return s && f.published && f.before && f.after
      ? [{ t: s.t, tag: s.t, before: fileUrl(f.before), after: fileUrl(f.after) }]
      : [];
  });
  const fixed = t.cases.items.flatMap((i) => (i.before && i.after ? [{ ...i, before: i.before, after: i.after }] : []));
  return [...uploaded, ...fixed];
}

import { ar, type Messages } from "@/lib/i18n";
import { certificates, slugOf } from "@/lib/certificates";
import CertTrack from "./motion/CertTrack";

export default function Certificates({ t = ar }: { t?: Messages }) {
  const docs = [t.doctors.lead, ...t.doctors.team];
  const lists = docs.map((d) => {
    const slug = slugOf(d.img);
    return (certificates[slug] ?? []).map((cert) => ({ ...cert, doctor: d.name, slug }));
  });
  // Interleave doctors so the wall mixes all three instead of ten of one in a row.
  const items = Array.from({ length: Math.max(...lists.map((l) => l.length)) }, (_, i) => lists.map((l) => l[i]))
    .flat()
    .filter(Boolean);
  const since = Math.min(...items.filter((c) => c.year).map((c) => +c.year));

  return <CertTrack items={items} c={t.certificates} doctors={docs.length} since={since} />;
}

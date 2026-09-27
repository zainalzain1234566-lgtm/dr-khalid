import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileBar from "@/components/MobileBar";
import t from "@/messages/ar.json";
import { certificates, slugOf } from "@/lib/certificates";
import CertificatesGallery from "./CertificatesGallery";

export const metadata: Metadata = { title: "شهادات الأطباء — عيادات الدكتور خالد العطار", alternates: { canonical: "/certificates" } };

const doctors = [t.doctors.lead, ...t.doctors.team].map((d) => {
  const slug = slugOf(d.img);
  return { slug, name: d.name, role: d.role, img: d.img, certs: certificates[slug] ?? [] };
});

// Deep link from the doctors section: /certificates?d=dr-karrar
export default async function CertificatesPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  const initial = doctors.some((doc) => doc.slug === d) ? d! : doctors[0].slug;
  return (
    <div className="themed overflow-x-clip pb-[84px] lg:pb-0">
      <Header />
      <main>
        <CertificatesGallery doctors={doctors} initial={initial} />
      </main>
      <Footer />
      <MobileBar />
    </div>
  );
}

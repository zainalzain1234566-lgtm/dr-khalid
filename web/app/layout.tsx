import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Readex_Pro } from "next/font/google";
import MotionProvider from "@/components/motion/MotionProvider";
import t from "@/messages/ar.json";
import { INSTAGRAM_URL, MAPS_URL, SITE_URL } from "@/lib/site";
import "./globals.css";

const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
});

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: t.meta.title,
  description: t.meta.description,
  keywords: ["طبيب أسنان البصرة", "زراعة الأسنان البصرة", "تقويم الأسنان البصرة", "ابتسامة المشاهير", "خالد العطار", "عيادة أسنان الجنينة"],
  alternates: { canonical: "/" },
  icons: { icon: "/logo.webp" },
  openGraph: {
    type: "website",
    locale: "ar_IQ",
    siteName: "عيادات الدكتور خالد العطار",
    title: t.meta.title,
    description: t.meta.description,
    images: [{ url: "/clinic/01.webp" }],
  },
  twitter: { card: "summary_large_image" },
};

// Google rich result: local dental business.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  name: "عيادات الدكتور خالد العطار لتقويم وزراعة الأسنان",
  description: t.meta.description,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.webp`,
  image: `${SITE_URL}/clinic/01.webp`,
  telephone: "+9647733900003",
  address: { "@type": "PostalAddress", addressLocality: "البصرة", streetAddress: "الجنينة", addressCountry: "IQ" },
  hasMap: MAPS_URL,
  sameAs: [INSTAGRAM_URL],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${readex.variable} ${plex.variable} antialiased`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <MotionProvider dir="rtl">{children}</MotionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import MotionProvider from "@/components/motion/MotionProvider";
import { en as t } from "@/lib/i18n";
import { fontVars } from "@/lib/fonts";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: t.meta.title,
  description: t.meta.description,
  keywords: ["dentist Basra", "dental implants Basra", "orthodontics Basra", "Khalid Al-Attar", "dental clinic Iraq"],
  alternates: { canonical: "/en", languages: { ar: "/", en: "/en" } },
  icons: { icon: "/logo.webp" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: t.header.clinicName,
    title: t.meta.title,
    description: t.meta.description,
    images: [{ url: "/clinic/01.webp" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function EnLayout({ children }: LayoutProps<"/en">) {
  return (
    <html lang="en" dir="ltr" className={fontVars} suppressHydrationWarning>
      <body className="grain">
        <MotionProvider dir="ltr">{children}</MotionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BookingForm from "./BookingForm";

export const metadata: Metadata = { title: "احجز موعدك — عيادات الدكتور خالد العطار" };

export default function BookPage() {
  return (
    <div className="themed flex min-h-dvh flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5 lg:px-12 lg:py-5">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.webp" alt="شعار العيادة" width={44} height={44} className="h-9 w-auto lg:h-11" />
          <b className="font-heading font-bold text-ink-900">عيادات الدكتور خالد العطار</b>
        </Link>
        <Link href="/" aria-label="إغلاق" className="flex size-11 items-center justify-center rounded-full border border-line text-xl text-ink-900">✕</Link>
      </header>
      <main className="flex flex-1 justify-center px-4 pt-5 pb-32 lg:px-8 lg:pt-6 lg:pb-24">
        <div className="w-full max-w-[1200px]">
          <BookingForm />
        </div>
      </main>
    </div>
  );
}

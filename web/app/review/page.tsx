import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ReviewForm from "./ReviewForm";

export const metadata: Metadata = { title: "قيّم تجربتك — عيادات الدكتور خالد العطار" };

export default function ReviewPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5 lg:px-12 lg:py-5">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.webp" alt="شعار العيادة" width={44} height={44} className="h-9 w-auto lg:h-11" />
          <b className="font-heading font-bold text-ink-900">عيادات الدكتور خالد العطار</b>
        </Link>
        <Link href="/" className="flex min-h-11 items-center text-[15px] font-semibold">→ الرئيسية</Link>
      </header>
      <main className="flex flex-1 justify-center px-4 pt-7 pb-10 lg:px-8 lg:pt-16 lg:pb-24">
        <div className="flex w-full max-w-[680px] flex-col gap-6">
          <ReviewForm />
        </div>
      </main>
    </div>
  );
}

import { listFiles, readText } from "@/lib/storage";

export type Review = { id: string; name?: string; doctor: string; case: string; stars: number; text: string; date: string };

// Approved reviews, newest first. Moderated from Telegram (see app/api/telegram/route.ts).
// ponytail: one read per review; move to a DB when there are hundreds.
export async function approvedReviews(): Promise<Review[]> {
  const files = await listFiles("reviews/approved/").catch(() => []);
  const all = await Promise.all(files.map(async (f) => JSON.parse((await readText(f.key)) ?? "null") as Review | null));
  return all.filter((r): r is Review => !!r).sort((a, b) => b.date.localeCompare(a.date));
}

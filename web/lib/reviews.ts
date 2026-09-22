import { list } from "@vercel/blob";

export type Review = { id: string; name?: string; doctor: string; case: string; stars: number; text: string; date: string };

// Approved reviews, newest first. Moderated from Telegram (see app/api/telegram/route.ts).
// ponytail: one fetch per review; move to a DB when there are hundreds.
export async function approvedReviews(): Promise<Review[]> {
  const { blobs } = await list({ prefix: "reviews/approved/" }).catch(() => ({ blobs: [] }));
  const all = await Promise.all(blobs.map((b) => fetch(b.url).then((r) => r.json() as Promise<Review>)));
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

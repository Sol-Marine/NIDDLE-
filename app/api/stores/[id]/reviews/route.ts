import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import {
  getStoreReviews,
  createStoreReview,
  hasUserReviewedStore,
  updateStore,
  getStoreById,
  getStoreReviewStats,
} from "@/app/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const reviews = await getStoreReviews(id);
    const stats = await getStoreReviewStats(id);
    return NextResponse.json({ reviews, stats });
  } catch {
    return NextResponse.json({ reviews: [], stats: { average: 0, count: 0 } });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const already = await hasUserReviewedStore(id, user.id);
  if (already) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const { rating, comment } = await req.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const review = await createStoreReview({
    id: crypto.randomUUID(),
    storeId: id,
    userId: user.id,
    userName: user.name,
    rating: Math.round(rating),
    comment: comment || "",
    createdAt: new Date().toISOString(),
  });

  const stats = await getStoreReviewStats(id);
  await updateStore(id, { rating: stats.average });

  return NextResponse.json(review, { status: 201 });
}

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db/auth";
import { Repository } from "@/lib/db/repository";
import type { GoalReview } from "@/lib/goalTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const periodType = (searchParams.get("periodType") as "weekly" | "monthly") || undefined;
    const reviews = Repository.getGoalReviews(user.id, periodType);

    return NextResponse.json({ success: true, reviews });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching reviews";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as { review: GoalReview };
    if (!body.review) {
      return NextResponse.json({ error: "Missing review in request body" }, { status: 400 });
    }

    const saved = Repository.saveGoalReview(user.id, body.review);
    return NextResponse.json({ success: true, review: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db/auth";
import { Repository } from "@/lib/db/repository";
import type { GoalRecoveryPlan } from "@/lib/goalTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const weekKey = searchParams.get("weekKey") || undefined;
    const plans = Repository.getGoalRecoveryPlans(user.id, weekKey);

    return NextResponse.json({ success: true, plans });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching recovery plans";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as { plan?: GoalRecoveryPlan; plans?: GoalRecoveryPlan[] };

    if (body.plan) {
      const saved = Repository.saveGoalRecoveryPlan(user.id, body.plan);
      return NextResponse.json({ success: true, plan: saved });
    }

    if (Array.isArray(body.plans)) {
      const results = body.plans.map((p) =>
        Repository.saveGoalRecoveryPlan(user.id, p)
      );
      return NextResponse.json({ success: true, plans: results });
    }

    return NextResponse.json({ error: "Missing plan or plans" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save recovery plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

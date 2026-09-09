import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db/auth";
import { Repository } from "@/lib/db/repository";
import type { Goal, GoalInstance, GoalLevel } from "@/lib/goalTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const level = (searchParams.get("level") as GoalLevel) || undefined;
    const periodKey = searchParams.get("periodKey") || undefined;

    const goals = Repository.getGoals(user.id, level);
    const instances = Repository.getGoalInstances(user.id, periodKey);

    return NextResponse.json({
      success: true,
      goals,
      instances,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching goals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      action?: "upsertGoal" | "deleteGoal" | "upsertInstance" | "batchUpsertInstances";
      goal?: Goal;
      goalId?: string;
      instance?: GoalInstance;
      instances?: GoalInstance[];
    };

    const { action } = body;

    if (action === "upsertGoal" && body.goal) {
      const savedGoal = Repository.upsertGoal(user.id, body.goal);
      return NextResponse.json({ success: true, goal: savedGoal });
    }

    if (action === "deleteGoal" && body.goalId) {
      const deleted = Repository.deleteGoal(user.id, body.goalId);
      return NextResponse.json({ success: true, deleted });
    }

    if (action === "upsertInstance" && body.instance) {
      const savedInstance = Repository.upsertGoalInstance(user.id, body.instance);
      return NextResponse.json({ success: true, instance: savedInstance });
    }

    if (action === "batchUpsertInstances" && Array.isArray(body.instances)) {
      const results = body.instances.map((inst) =>
        Repository.upsertGoalInstance(user.id, inst)
      );
      return NextResponse.json({ success: true, instances: results });
    }

    return NextResponse.json({ error: "Invalid action or payload" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Goal operation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

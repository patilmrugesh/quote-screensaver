import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db/auth";
import { Repository } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ user: null, cloudData: null });
  }

  const cloudData = {
    habits: Repository.getHabits(user.id),
    tasks: Repository.getTasks(user.id),
    sessions: Repository.getPomodoroSessions(user.id),
    gamification: Repository.getGamification(user.id),
    favorites: Repository.getFavorites(user.id),
    settings: Repository.getUserSettings(user.id),
    goals: Repository.getGoals(user.id),
    goalInstances: Repository.getGoalInstances(user.id),
    goalReviews: Repository.getGoalReviews(user.id),
    goalRecoveryPlans: Repository.getGoalRecoveryPlans(user.id),
  };

  return NextResponse.json({ user, cloudData });
}

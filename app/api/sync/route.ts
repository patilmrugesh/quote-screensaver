import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db/auth";
import { Repository } from "@/lib/db/repository";
import type { HabitItem, TaskItem } from "@/lib/todoHabitTypes";
import type { PomodoroSession, GamificationProfile } from "@/lib/pomodoroTypes";
import type { Quote, CustomizationSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      habits?: HabitItem[];
      tasks?: TaskItem[];
      sessions?: PomodoroSession[];
      gamification?: GamificationProfile;
      favorites?: Quote[];
      settings?: CustomizationSettings;
    };

    const synchronized = Repository.syncAllUserData(user.id, body);

    return NextResponse.json({
      success: true,
      syncedAt: Date.now(),
      data: synchronized,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

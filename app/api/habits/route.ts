import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db/auth";
import { Repository } from "@/lib/db/repository";
import type { HabitItem } from "@/lib/todoHabitTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habits = Repository.getHabits(user.id);
  return NextResponse.json({ habits });
}

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as { habit?: HabitItem; habits?: HabitItem[] };

    if (body.habits && Array.isArray(body.habits)) {
      for (const h of body.habits) {
        Repository.upsertHabit(user.id, h);
      }
    } else if (body.habit) {
      Repository.upsertHabit(user.id, body.habit);
    } else {
      return NextResponse.json({ error: "Missing habit payload" }, { status: 400 });
    }

    const updatedHabits = Repository.getHabits(user.id);
    return NextResponse.json({ success: true, habits: updatedHabits });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error saving habit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing habit id" }, { status: 400 });
  }

  Repository.deleteHabit(user.id, id);
  return NextResponse.json({ success: true, message: "Habit deleted" });
}

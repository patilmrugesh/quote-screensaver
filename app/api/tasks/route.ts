import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db/auth";
import { Repository } from "@/lib/db/repository";
import type { TaskItem } from "@/lib/todoHabitTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = Repository.getTasks(user.id);
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as { task?: TaskItem; tasks?: TaskItem[] };

    if (body.tasks && Array.isArray(body.tasks)) {
      for (const t of body.tasks) {
        Repository.upsertTask(user.id, t);
      }
    } else if (body.task) {
      Repository.upsertTask(user.id, body.task);
    } else {
      return NextResponse.json({ error: "Missing task payload" }, { status: 400 });
    }

    const updatedTasks = Repository.getTasks(user.id);
    return NextResponse.json({ success: true, tasks: updatedTasks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error saving task";
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
    return NextResponse.json({ error: "Missing task id" }, { status: 400 });
  }

  Repository.deleteTask(user.id, id);
  return NextResponse.json({ success: true, message: "Task deleted" });
}

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db/auth";
import { Repository } from "@/lib/db/repository";
import type { PomodoroSession } from "@/lib/pomodoroTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = Repository.getPomodoroSessions(user.id);
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as { session?: PomodoroSession };
    if (!body.session) {
      return NextResponse.json({ error: "Missing session" }, { status: 400 });
    }

    Repository.addPomodoroSession(user.id, body.session);
    return NextResponse.json({ success: true, message: "Session recorded" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error saving session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

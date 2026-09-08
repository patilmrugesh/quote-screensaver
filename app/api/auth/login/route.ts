import { NextResponse } from "next/server";
import { Repository } from "@/lib/db/repository";
import { verifyPassword, createSession } from "@/lib/db/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { identifier?: string; password?: string };
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/email and password are required." },
        { status: 400 }
      );
    }

    const user = Repository.findUserByUsernameOrEmail(identifier);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const isMatch = verifyPassword(password, user.password_hash, user.salt);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const session = createSession(user.id);

    const cloudData = {
      habits: Repository.getHabits(user.id),
      tasks: Repository.getTasks(user.id),
      sessions: Repository.getPomodoroSessions(user.id),
      gamification: Repository.getGamification(user.id),
      favorites: Repository.getFavorites(user.id),
      settings: Repository.getUserSettings(user.id),
    };

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
      },
      token: session.token,
      cloudData,
    });

    response.cookies.set("auth_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

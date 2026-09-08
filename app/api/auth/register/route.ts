import { NextResponse } from "next/server";
import { Repository } from "@/lib/db/repository";
import { createSession } from "@/lib/db/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: string; email?: string; password?: string };
    const { username, email, password } = body;

    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Check existing
    const existing = Repository.findUserByUsernameOrEmail(username) || Repository.findUserByUsernameOrEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "A user with that username or email already exists." },
        { status: 409 }
      );
    }

    // Create user
    const newUser = Repository.createUser(username, email, password);
    const session = createSession(newUser.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.created_at,
      },
      token: session.token,
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

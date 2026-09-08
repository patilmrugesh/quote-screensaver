import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/db/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  if (match && match[1]) {
    deleteSession(match[1]);
  }

  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}

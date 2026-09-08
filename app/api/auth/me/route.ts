import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}

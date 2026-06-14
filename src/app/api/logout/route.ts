// POST /api/logout → clears the auth cookie.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";

export async function POST() {
  const c = await cookies();
  c.delete(AUTH_COOKIE);
  return NextResponse.json({ ok: true });
}

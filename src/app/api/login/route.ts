// POST /api/login  { password }  → sets the auth cookie if the password matches.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, authToken, gateEnabled } from "@/lib/auth";

export async function POST(req: Request) {
  if (!gateEnabled()) return NextResponse.json({ ok: true, disabled: true });

  let password = "";
  try {
    password = (await req.json())?.password ?? "";
  } catch {
    /* ignore */
  }

  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Wrong password." }, { status: 401 });
  }

  const c = await cookies();
  c.set(AUTH_COOKIE, await authToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return NextResponse.json({ ok: true });
}

import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, authToken, gateEnabled } from "@/lib/auth";

// Routes always allowed through the gate:
//  - the login page + its API
//  - /api/track  (external trackers POST here; they have no session cookie)
const PUBLIC = ["/login", "/api/login", "/api/logout", "/api/track"];

export async function middleware(req: NextRequest) {
  if (!gateEnabled()) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const expected = await authToken();
  if (token && token === expected) return NextResponse.next();

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  // run on everything except static assets and downloadable files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|files).*)"],
};

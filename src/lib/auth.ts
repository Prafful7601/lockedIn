// Tiny password-gate auth. One shared password (APP_PASSWORD) protects the whole
// app. On login we set an httpOnly cookie holding a hash of the password+secret;
// middleware checks it on every request. Edge-compatible (uses Web Crypto only).
//
// If APP_PASSWORD is unset, the gate is DISABLED (app is open) — so local dev
// works with zero config and you opt into protection by setting the env var.

export const AUTH_COOKIE = "lockedin_auth";

export function gateEnabled(): boolean {
  return !!process.env.APP_PASSWORD;
}

// Deterministic token derived from the password + secret. Same input → same
// output in both the login route (Node) and middleware (Edge).
export async function authToken(): Promise<string> {
  const pw = process.env.APP_PASSWORD ?? "";
  const secret = process.env.AUTH_SECRET ?? "lockedin-dev-secret";
  const data = new TextEncoder().encode(`${pw}::${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

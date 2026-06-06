import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "oitii_sid";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Read or mint an anonymous session id stored in an httpOnly cookie.
 * Used to scope per-user data (applications, profile, resumes) without
 * requiring login during early MVP.
 */
export async function getOrCreateSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;

  if (existing && existing.length > 0) {
    return existing;
  }

  const fresh = randomUUID();
  store.set(SESSION_COOKIE, fresh, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
  return fresh;
}

/**
 * Read-only variant: returns the session id if present, else null.
 * Useful for read-only routes that shouldn't mutate cookies.
 */
export async function getSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

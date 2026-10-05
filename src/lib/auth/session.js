import { cookies } from "next/headers";
import { signSession, verifySession } from "./jwt";

const COOKIE = "lb_session";
const MAX_AGE = 60 * 60 * 24 * 7;

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload) return null;
  return { id: String(payload.sub), email: payload.email };
}

export async function createSession(user) {
  const token = await signSession({
    userId: String(user._id),
    email: user.email,
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

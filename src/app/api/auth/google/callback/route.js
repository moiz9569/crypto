import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeGoogleCode, fetchGoogleUser } from "@/lib/auth/google";
import {
  findUserByEmail,
  findUserByGoogleId,
  createUser,
  updateUserLastLogin,
  linkGoogleAccount,
} from "@/lib/auth/users";
import { createSession } from "@/lib/auth/session";

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const fail = (msg) =>
    NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(msg)}`);

  if (errorParam) return fail(errorParam);
  if (!code || !state) return fail("Missing code or state");

  const jar = await cookies();
  const cookieState = jar.get("lb_oauth_state")?.value;
  jar.delete("lb_oauth_state");
  if (!cookieState || cookieState !== state) return fail("Invalid OAuth state");

  try {
    const redirectUri = `${appUrl}/api/auth/google/callback`;
    const tokens = await exchangeGoogleCode({ code, redirectUri });
    const profile = await fetchGoogleUser(tokens.access_token);

    const email = String(profile.email ?? "").toLowerCase();
    const googleId = String(profile.sub ?? "");
    const name = profile.name ?? null;
    const image = profile.picture ?? null;

    if (!email || !googleId) return fail("Google did not return an email");

    let user = await findUserByGoogleId(googleId);

    if (!user) {
      const existing = await findUserByEmail(email);
      if (existing) {
        await linkGoogleAccount(existing._id, googleId, image);
        user = { ...existing, image };
      } else {
        user = await createUser({
          email,
          name,
          image,
          provider: "google",
          googleId,
        });
      }
    }

    await updateUserLastLogin(user._id);
    await createSession(user);

    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (err) {
    console.error("[auth/google/callback]", err);
    return fail("Google sign-in failed");
  }
}

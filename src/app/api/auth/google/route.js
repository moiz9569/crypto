import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { googleAuthUrl } from "@/lib/auth/google";

export async function GET(req) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const state = randomBytes(16).toString("hex");

  const res = NextResponse.redirect(googleAuthUrl({ redirectUri, state }));
  res.cookies.set("lb_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}

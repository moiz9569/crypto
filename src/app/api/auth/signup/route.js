import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/auth/users";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const name = body.name ? String(body.name).trim() : null;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }
    const passwordHash = await hashPassword(password);
    const user = await createUser({
      email,
      passwordHash,
      name,
      provider: "credentials",
    });
    await createSession(user);
    return NextResponse.json({
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        image: user.image,
      },
    });
  } catch (err) {
    console.error("[auth/signup]", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}

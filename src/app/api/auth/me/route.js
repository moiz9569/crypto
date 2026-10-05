import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ user: null });
  const user = await findUserById(session.id);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name,
      image: user.image,
    },
  });
}

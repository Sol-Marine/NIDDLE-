import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/app/lib/db";
import { resetTokens } from "../forgot-password/route";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();
  if (!token || !password) {
    return Response.json({ error: "Token and password required" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const entry = resetTokens.get(token);
  if (!entry || Date.now() > entry.expiresAt) {
    return Response.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const user = getUserByEmail(entry.email);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const { updateUser } = await import("@/app/lib/db");
  updateUser(user.id, { password: hashed });

  resetTokens.delete(token);
  return Response.json({ ok: true });
}

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/app/lib/db";
import { setSessionCookie } from "@/app/lib/auth";
import { rateLimit } from "@/app/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(`login:${ip}`, 5, 60_000)) {
    return Response.json({ error: "Too many attempts. Try again in 1 minute." }, { status: 429 });
  }

  const { email, password } = await request.json();
  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }
  const user = getUserByEmail(email);
  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  if (user.emailVerified === false) {
    return Response.json({ error: "Please verify your email first. Check your inbox for the verification link." }, { status: 403 });
  }
  await setSessionCookie(user.id);
  return Response.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

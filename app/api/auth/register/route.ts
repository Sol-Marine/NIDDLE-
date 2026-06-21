import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createUser, getUserByEmail } from "@/app/lib/db";
import { rateLimit } from "@/app/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(`register:${ip}`, 3, 60_000)) {
    return Response.json({ error: "Too many attempts. Try again in 1 minute." }, { status: 429 });
  }

  const { name, email, password } = await request.json();
  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  const existing = await getUserByEmail(email);
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const user = await createUser({
    id: "user-" + crypto.randomUUID(),
    name: name || email.split("@")[0],
    email,
    password: hashed,
    role: "staff",
    emailVerified: false,
    emailVerifyToken: verifyToken,
    createdAt: new Date().toISOString(),
  });
  return Response.json({ ok: true, verifyToken }, { status: 201 });
}

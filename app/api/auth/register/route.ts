import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "@/app/lib/db";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();
  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }
  const existing = getUserByEmail(email);
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = createUser({
    id: "user-" + Date.now(),
    name: name || email.split("@")[0],
    email,
    password: hashed,
    role: "staff",
    createdAt: new Date().toLocaleString(),
  });
  const cookieStore = await cookies();
  cookieStore.set("session", user.id, { httpOnly: true, path: "/", maxAge: 86400 * 7 });
  return Response.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
}

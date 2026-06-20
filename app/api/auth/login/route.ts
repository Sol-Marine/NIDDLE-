import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/app/lib/db";
import { setSessionCookie } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
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
  await setSessionCookie(user.id);
  return Response.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

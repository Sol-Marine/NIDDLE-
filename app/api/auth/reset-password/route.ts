import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { supabase, updateUser } from "@/app/lib/db";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();
  if (!token || !password) {
    return Response.json({ error: "Token and password required" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email_verify_token", token)
    .single();

  if (!user) {
    return Response.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await updateUser(user.id, { password: hashed, emailVerifyToken: undefined });

  return Response.json({ ok: true });
}

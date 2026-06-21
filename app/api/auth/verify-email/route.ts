import { NextRequest } from "next/server";
import { supabase, updateUser } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return Response.json({ error: "Token required" }, { status: 400 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email_verify_token", token)
    .single();

  if (!user) {
    return Response.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  await updateUser(user.id, { emailVerified: true, emailVerifyToken: undefined });

  return Response.json({ ok: true });
}

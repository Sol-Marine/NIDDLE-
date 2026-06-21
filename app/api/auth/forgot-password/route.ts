import { NextRequest } from "next/server";
import { getUserByEmail, supabase } from "@/app/lib/db";
import { rateLimit } from "@/app/lib/rate-limit";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`forgot:${ip}`, 3, 300_000)) {
    return Response.json({ error: "Too many requests. Try again in 5 minutes." }, { status: 429 });
  }

  const { email } = await request.json();
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });

  const user = await getUserByEmail(email);

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600_000).toISOString();
    await supabase
      .from("users")
      .update({ email_verify_token: token })
      .eq("id", user.id);
    return Response.json({ ok: true, token });
  }

  return Response.json({ ok: true, token: null });
}

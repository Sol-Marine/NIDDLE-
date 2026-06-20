import { NextRequest } from "next/server";
import { getUserByEmail } from "@/app/lib/db";
import { rateLimit } from "@/app/lib/rate-limit";
import crypto from "crypto";

const resetTokens = new Map<string, { email: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`forgot:${ip}`, 3, 300_000)) {
    return Response.json({ error: "Too many requests. Try again in 5 minutes." }, { status: 429 });
  }

  const { email } = await request.json();
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });

  const user = getUserByEmail(email);

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    resetTokens.set(token, { email, expiresAt: Date.now() + 3600_000 });
    return Response.json({ ok: true, token });
  }

  return Response.json({ ok: true, token: null });
}

export { resetTokens };

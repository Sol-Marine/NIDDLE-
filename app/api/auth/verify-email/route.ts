import { NextRequest } from "next/server";
import { getUserByEmail, updateUser } from "@/app/lib/db";
import { verifyTokens } from "../register/route";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return Response.json({ error: "Token required" }, { status: 400 });
  }

  const entry = verifyTokens.get(token);
  if (!entry || Date.now() > entry.expiresAt) {
    return Response.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const user = getUserByEmail(entry.email);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  updateUser(user.id, { emailVerified: true, emailVerifyToken: undefined });
  verifyTokens.delete(token);

  return Response.json({ ok: true });
}

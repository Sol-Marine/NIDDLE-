import crypto from "crypto";
import { cookies } from "next/headers";
import { getUserById } from "./db";

const SECRET = process.env.SESSION_SECRET!;
if (!SECRET) throw new Error("SESSION_SECRET env var is required");

export function signSession(userId: string): string {
  const sig = crypto.createHmac("sha256", SECRET).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

export function verifySession(token: string): string | null {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const userId = token.substring(0, lastDot);
  const sig = token.substring(lastDot + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(userId).digest("hex");
  if (sig !== expected) return null;
  return userId;
}

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", signSession(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400 * 7,
  });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return null;
  const userId = verifySession(session.value);
  if (!userId) return null;
  const user = await getUserById(userId);
  if (!user) return null;
  return user;
}

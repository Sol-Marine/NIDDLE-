import { NextRequest } from "next/server";
import { createContactMessage } from "@/app/lib/db";
import { rateLimit } from "@/app/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(`contact:${ip}`, 3, 60_000)) {
    return Response.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }

  const { name, email, subject, message } = await request.json();
  if (!name || !email || !message) {
    return Response.json({ error: "Name, email, and message are required" }, { status: 400 });
  }

  const msg = createContactMessage({
    id: "msg-" + crypto.randomUUID(),
    name,
    email,
    subject: subject || "No subject",
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });

  return Response.json({ ok: true, id: msg.id }, { status: 201 });
}

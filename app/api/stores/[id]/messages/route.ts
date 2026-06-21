import { NextRequest } from "next/server";
import { getStoreMessages, createStoreMessage, markStoreMessagesRead } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const messages = await getStoreMessages(id);
  await markStoreMessagesRead(id, user.id);
  return Response.json(messages);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { message } = body;

  if (!message?.trim()) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const msg = await createStoreMessage({
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    storeId: id,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role || "customer",
    message: message.trim(),
    read: false,
    createdAt: now,
  });

  return Response.json(msg, { status: 201 });
}

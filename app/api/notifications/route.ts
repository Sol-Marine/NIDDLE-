import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getUserById, getNotifications, getUnreadCount, markNotificationRead } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const user = getUserById(session.value);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  if (searchParams.get("count") === "true") {
    return Response.json({ count: getUnreadCount(session.value) });
  }

  return Response.json(getNotifications(session.value));
}

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const updated = markNotificationRead(id);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

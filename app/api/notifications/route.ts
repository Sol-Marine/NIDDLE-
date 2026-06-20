import { NextRequest } from "next/server";
import { getNotifications, getUnreadCount, markNotificationRead } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  if (searchParams.get("count") === "true") {
    return Response.json({ count: getUnreadCount(user.id) });
  }

  return Response.json(getNotifications(user.id));
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return Response.json({ error: "Notification id required" }, { status: 400 });

  const userNotifications = getNotifications(user.id);
  const owns = userNotifications.some((n) => n.id === id);
  if (!owns) return Response.json({ error: "Forbidden" }, { status: 403 });

  const updated = markNotificationRead(id);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getUserById, createNotification, getDeliveries, getReceiveRequests, getRiders, updateDelivery } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const user = getUserById(session.value);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "overview";

  if (type === "deliveries") {
    return Response.json(getDeliveries());
  }
  if (type === "requests") {
    return Response.json(getReceiveRequests());
  }
  if (type === "riders") {
    return Response.json(getRiders());
  }

  const deliveries = getDeliveries();
  return Response.json({
    totalDeliveries: deliveries.length,
    activeDeliveries: deliveries.filter((d) => d.status !== "delivered").length,
    deliveredToday: deliveries.filter((d) => d.status === "delivered" && d.deliveredAt?.includes(new Date().toLocaleDateString())).length,
    pendingRequests: getReceiveRequests().filter((r) => r.status === "pending").length,
  });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const user = getUserById(session.value);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, status, riderName } = body;

  if (!id) return Response.json({ error: "Delivery ID required" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (riderName) updates.riderName = riderName;

  const updated = updateDelivery(id, updates);
  if (!updated) return Response.json({ error: "Delivery not found" }, { status: 404 });

  createNotification({
    id: "notif-" + Date.now(),
    userId: session.value,
    title: "Delivery Updated",
    message: `${updated.id} is now "${status || riderName || "updated"}"`,
    link: `/track?id=${id}`,
    read: false,
    createdAt: new Date().toLocaleString(),
  });

  return Response.json(updated);
}

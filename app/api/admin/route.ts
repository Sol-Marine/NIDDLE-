import { NextRequest } from "next/server";
import { createNotification, getDeliveries, getReceiveRequests, getRiders, updateDelivery } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "staff") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "overview";

  if (type === "deliveries") {
    return Response.json(await getDeliveries());
  }
  if (type === "requests") {
    return Response.json(await getReceiveRequests());
  }
  if (type === "riders") {
    return Response.json(await getRiders());
  }

  const deliveries = await getDeliveries();
  return Response.json({
    totalDeliveries: deliveries.length,
    activeDeliveries: deliveries.filter((d) => d.status !== "delivered").length,
    deliveredToday: deliveries.filter((d) => d.status === "delivered" && d.deliveredAt?.includes(new Date().toLocaleDateString())).length,
    pendingRequests: (await getReceiveRequests()).filter((r) => r.status === "pending").length,
  });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "staff") return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, status, riderName } = body;

  if (!id) return Response.json({ error: "Delivery ID required" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (riderName) updates.riderName = riderName;

  const updated = await updateDelivery(id, updates);
  if (!updated) return Response.json({ error: "Delivery not found" }, { status: 404 });

  await createNotification({
    id: "notif-" + crypto.randomUUID(),
    userId: user.id,
    title: "Delivery Updated",
    message: `${updated.id} is now "${status || riderName || "updated"}"`,
    link: `/track?id=${id}`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  return Response.json(updated);
}

import { NextRequest } from "next/server";
import { createNotification, getDeliveries, getReceiveRequests, getRiders, updateDelivery, supabase } from "@/app/lib/db";
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

  if (type === "stats") {
    const period = searchParams.get("period") || "week";
    const now = new Date();
    let startDate = new Date();

    if (period === "week") startDate.setDate(now.getDate() - 7);
    else if (period === "month") startDate.setDate(now.getDate() - 30);
    else if (period === "year") startDate.setFullYear(now.getFullYear() - 1);

    const { data: storeOrders } = await supabase
      .from("store_orders")
      .select("id, total_price, delivery_fee, created_at, store_id, status")
      .gte("created_at", startDate.toISOString())
      .neq("status", "cancelled");

    const today = new Date().toDateString();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const orders = storeOrders || [];
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0) + (o.delivery_fee || 0), 0);
    const todayRevenue = orders.filter((o) => new Date(o.created_at).toDateString() === today).reduce((sum, o) => sum + (o.total_price || 0) + (o.delivery_fee || 0), 0);
    const weekRevenue = orders.filter((o) => new Date(o.created_at).getTime() > weekAgo).reduce((sum, o) => sum + (o.total_price || 0) + (o.delivery_fee || 0), 0);
    const monthRevenue = orders.filter((o) => new Date(o.created_at) >= monthStart).reduce((sum, o) => sum + (o.total_price || 0) + (o.delivery_fee || 0), 0);

    const storeRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};
    for (const o of orders) {
      if (!storeRevenue[o.store_id]) storeRevenue[o.store_id] = { name: o.store_id, revenue: 0, orders: 0 };
      storeRevenue[o.store_id].revenue += (o.total_price || 0) + (o.delivery_fee || 0);
      storeRevenue[o.store_id].orders += 1;
    }

    const { data: stores } = await supabase.from("stores").select("id, name");
    const storeMap: Record<string, string> = {};
    stores?.forEach((s) => { storeMap[s.id] = s.name; });

    const topStores = Object.values(storeRevenue)
      .map((s) => ({ ...s, name: storeMap[s.name] || s.name }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const dailyMap: Record<string, { revenue: number; orders: number }> = {};
    const days = period === "week" ? 7 : period === "month" ? 30 : 12;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = { revenue: 0, orders: 0 };
    }
    for (const o of orders) {
      const key = o.created_at.split("T")[0];
      if (dailyMap[key]) {
        dailyMap[key].revenue += (o.total_price || 0) + (o.delivery_fee || 0);
        dailyMap[key].orders += 1;
      }
    }

    return Response.json({
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
      topStores,
      dailyRevenue: Object.entries(dailyMap).map(([date, data]) => ({ date, ...data })),
    });
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

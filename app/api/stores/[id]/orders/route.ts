import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/db";
import { findCoords } from "@/app/lib/coords";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { id: storeId } = await params;
  const tracking = req.nextUrl.searchParams.get("tracking");

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();

  if (!store || (store.owner_id !== user.id && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!tracking) {
    const { data: orders } = await supabase
      .from("store_orders")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });
    return NextResponse.json({ orders: orders || [] });
  }

  const { data: activeOrders } = await supabase
    .from("store_orders")
    .select("*, riders!inner(id, name, lat, lng)")
    .eq("store_id", storeId)
    .in("status", ["ready", "picked-up", "in-transit"])
    .not("rider_id", "is", null);

  if (!activeOrders || activeOrders.length === 0) {
    return NextResponse.json({ orders: [] });
  }

  const enriched = activeOrders.map((order) => {
    const pickup = findCoords(store.address || "Lagos, Nigeria");
    const delivery = findCoords(order.delivery_address || "Lagos, Nigeria");
    const riderData = order.riders as { name?: string; lat?: number; lng?: number } | null;

    return {
      orderId: order.id,
      customerName: order.customer_name || "Customer",
      deliveryAddress: order.delivery_address || "Lagos, Nigeria",
      riderName: riderData?.name || order.rider_name || "Rider",
      riderStatus: order.rider_status || "pending",
      riderLat: riderData?.lat || null,
      riderLng: riderData?.lng || null,
      pickupLat: pickup[0],
      pickupLng: pickup[1],
      deliveryLat: delivery[0],
      deliveryLng: delivery[1],
    };
  });

  return NextResponse.json({ orders: enriched });
}

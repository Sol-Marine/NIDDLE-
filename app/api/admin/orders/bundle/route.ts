import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { storeId, orderIds } = await req.json();

  if (!storeId || !orderIds || orderIds.length < 2) {
    return NextResponse.json({ error: "Select at least 2 orders to bundle" }, { status: 400 });
  }

  const { data: orders } = await supabase
    .from("store_orders")
    .select("*")
    .eq("store_id", storeId)
    .in("id", orderIds)
    .in("status", ["pending", "confirmed"]);

  if (!orders || orders.length < 2) {
    return NextResponse.json({ error: "Not enough eligible orders" }, { status: 400 });
  }

  const bundleId = `bundle-${Date.now()}`;
  const totalItems = orders.reduce((sum, o) => sum + (o.quantity || 1), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const { error: bundleError } = await supabase.from("order_bundles").insert({
    id: bundleId,
    store_id: storeId,
    order_ids: orderIds,
    total_items: totalItems,
    total_revenue: totalRevenue,
    status: "pending",
    created_at: new Date().toISOString(),
  });

  if (bundleError) {
    return NextResponse.json({ error: "Failed to create bundle" }, { status: 500 });
  }

  await supabase
    .from("store_orders")
    .update({ bundle_id: bundleId })
    .in("id", orderIds);

  return NextResponse.json({
    id: bundleId,
    totalItems,
    totalRevenue,
    orderCount: orders.length,
  });
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { data: bundles } = await supabase
    .from("order_bundles")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({ bundles: bundles || [] });
}

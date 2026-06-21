import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, riderId } = await req.json();

  const validTransitions: Record<string, string[]> = {
    assigned: ["accepted", "rejected"],
    accepted: ["heading-to-store", "cancelled"],
    "heading-to-store": ["at-store", "cancelled"],
    "at-store": ["picked-up"],
    "picked-up": ["in-transit"],
    "in-transit": ["delivered"],
    delivered: [],
  };

  const { data: order, error: fetchError } = await supabase
    .from("store_orders")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const allowed = validTransitions[order.rider_status] || [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${order.rider_status} to ${status}` },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {
    rider_status: status,
    updated_at: new Date().toISOString(),
  };

  const orderStatusMap: Record<string, string> = {
    "heading-to-store": "confirmed",
    "at-store": "preparing",
    "picked-up": "picked-up",
    "in-transit": "in-transit",
    delivered: "delivered",
  };

  if (orderStatusMap[status]) {
    updates.status = orderStatusMap[status];
  }

  if (status === "delivered") {
    updates.delivered_at = new Date().toISOString();

    const { data: store } = await supabase
      .from("stores")
      .select("owner_id")
      .eq("id", order.store_id)
      .single();

    if (store) {
      await supabase.from("notifications").insert({
        id: crypto.randomUUID(),
        user_id: store.owner_id,
        title: "Order Delivered",
        message: `Order ${id.slice(0, 8)} has been delivered!`,
        link: "/store/dashboard",
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    if (riderId) {
      const { data: riderScore } = await supabase
        .from("rider_scores")
        .select("*")
        .eq("rider_id", riderId)
        .single();

      if (riderScore) {
        const newTotal = riderScore.total_deliveries + 1;
        const earnings = order.delivery_fee * 0.7;
        await supabase
          .from("rider_scores")
          .update({
            total_deliveries: newTotal,
            updated_at: new Date().toISOString(),
          })
          .eq("rider_id", riderId);

        const { data: wallet } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", (await supabase.from("riders").select("name").eq("id", riderId).single()).data?.name ?? "")
          .single();

        if (wallet) {
          await supabase
            .from("wallets")
            .update({ balance: wallet.balance + earnings })
            .eq("id", wallet.id);

          await supabase.from("wallet_transactions").insert({
            id: crypto.randomUUID(),
            wallet_id: wallet.id,
            type: "credit",
            amount: earnings,
            reference: `delivery-${id.slice(0, 8)}`,
            description: `Earnings from order ${id.slice(0, 8)}`,
            status: "completed",
            created_at: new Date().toISOString(),
          });
        }
      }
    }
  }

  const { error } = await supabase
    .from("store_orders")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, newStatus: status });
}

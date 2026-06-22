import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { supabase } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const orderId = req.nextUrl.searchParams.get("orderId");
  const riderId = req.nextUrl.searchParams.get("riderId");

  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const { data: messages } = await supabase
    .from("rider_messages")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (riderId) {
    await supabase
      .from("rider_messages")
      .update({ read: true })
      .eq("order_id", orderId)
      .neq("sender_id", String(riderId))
      .eq("read", false);
  }

  return NextResponse.json({ messages: messages || [] });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { orderId, senderId, senderName, senderRole, message } = await req.json();

  if (!orderId || !senderId || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("store_orders")
    .select("id, rider_id, customer_email")
    .eq("id", orderId)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (senderRole === "customer" && order.customer_email !== user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (senderRole === "rider" && String(order.rider_id) !== String(senderId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("rider_messages")
    .insert({
      id: crypto.randomUUID(),
      order_id: orderId,
      sender_id: String(senderId),
      sender_name: senderName,
      sender_role: senderRole,
      message,
      read: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: data });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { orderId, readerRole } = await req.json();
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const filterRole = readerRole === "rider" ? "customer" : "rider";

  await supabase
    .from("rider_messages")
    .update({ read: true })
    .eq("order_id", orderId)
    .eq("sender_role", filterRole)
    .eq("read", false);

  return NextResponse.json({ success: true });
}

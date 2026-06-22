import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/db";
import { sendRiderAssigned } from "@/app/lib/email";
import { sendRiderAssignedSMS } from "@/app/lib/sms";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { riderId, riderName } = await req.json();

  const { data: order, error: fetchError } = await supabase
    .from("store_orders")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.rider_status !== "assigned") {
    return NextResponse.json({ error: "Order is no longer available" }, { status: 409 });
  }

  const { error } = await supabase
    .from("store_orders")
    .update({
      rider_status: "accepted",
      rider_id: riderId,
      rider_name: riderName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create notification for customer
  const customerEmail = order.customer_email;
  if (customerEmail) {
    const { data: customer } = await supabase
      .from("users")
      .select("id")
      .eq("email", customerEmail)
      .single();
    if (customer) {
      await supabase.from("notifications").insert({
        id: crypto.randomUUID(),
        user_id: customer.id,
        title: "Rider Assigned",
        message: `${riderName} is picking up your order!`,
        link: "/my-orders",
        read: false,
        created_at: new Date().toISOString(),
      });
    }
    sendRiderAssigned(customerEmail, order.customer_name, riderName, id).catch(() => {});
    if (order.customer_phone) {
      sendRiderAssignedSMS(order.customer_phone, riderName, id).catch(() => {});
    }
  }

  return NextResponse.json({ success: true });
}

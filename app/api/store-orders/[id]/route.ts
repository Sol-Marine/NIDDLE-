import { NextRequest } from "next/server";
import {
  getStoreOrderById,
  updateStoreOrder,
  getStoreById,
  createDelivery,
  DeliveryOrder,
  supabase,
} from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

async function notifyCustomer(email: string, title: string, message: string, link: string) {
  if (!email) return;
  const { data: customer } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();
  if (customer) {
    await supabase.from("notifications").insert({
      id: crypto.randomUUID(),
      user_id: customer.id,
      title,
      message,
      link,
      read: false,
      created_at: new Date().toISOString(),
    });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await getStoreOrderById(id);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const now = new Date().toISOString();
  const updated = await updateStoreOrder(id, { ...body, updatedAt: now });

  const statusMessages: Record<string, { title: string; message: string }> = {
    confirmed: { title: "Order Confirmed", message: `Your order has been confirmed by the store!` },
    preparing: { title: "Order Being Prepared", message: `Your order is being prepared now.` },
    ready: { title: "Order Ready", message: `Your order is ready for pickup!` },
    "picked-up": { title: "Order Picked Up", message: `Your order has been picked up by the rider!` },
    "in-transit": { title: "Order In Transit", message: `Your order is on its way to you!` },
    delivered: { title: "Order Delivered", message: `Your order has been delivered successfully!` },
    cancelled: { title: "Order Cancelled", message: `Your order has been cancelled.` },
  };

  if (updated && body.status && statusMessages[body.status]) {
    const notif = statusMessages[body.status];
    await notifyCustomer(order.customerEmail, notif.title, notif.message, "/my-orders");
  }

  if (updated && body.status === "ready" && order.status !== "ready") {
    const store = await getStoreById(order.storeId);
    if (store) {
      const delivery: DeliveryOrder = {
        id: crypto.randomUUID(),
        senderName: store.name,
        senderPhone: store.phone,
        pickupAddress: store.address,
        recipientName: order.customerName,
        recipientPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        packageType: "Store Order",
        packageSize: "Medium",
        handling: "",
        description: order.items.map((i) => `${i.name} x${i.qty}`).join(", "),
        weight: "",
        value: String(order.totalPrice),
        specialInstructions: order.specialInstructions,
        riderName: "",
        timeSlot: order.preferredTime,
        price: order.deliveryFee,
        status: "order-placed",
        createdAt: now,
      };
      await createDelivery(delivery);
    }
  }

  return Response.json(updated);
}

import { NextRequest } from "next/server";
import {
  getStoreOrderById,
  updateStoreOrder,
  getStoreById,
  createDelivery,
  DeliveryOrder,
} from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await getStoreOrderById(id);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const now = new Date().toISOString();
  const updated = await updateStoreOrder(id, { ...body, updatedAt: now });

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

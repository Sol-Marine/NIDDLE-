import { NextRequest } from "next/server";
import { getStoreOrders, createStoreOrder, getStoreById, updateStore } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");

  if (!storeId) {
    return Response.json({ error: "storeId required" }, { status: 400 });
  }

  const store = await getStoreById(storeId);
  if (!store) return Response.json({ error: "Store not found" }, { status: 404 });
  if (store.ownerId !== user.id && user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await getStoreOrders(storeId);
  return Response.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { storeId, customerName, customerPhone, customerEmail, deliveryAddress, items, totalPrice, deliveryFee, specialInstructions, preferredTime } = body;

  if (!storeId || !customerName || !customerPhone || !deliveryAddress || !items?.length) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const order = await createStoreOrder({
    id: `sorder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    storeId,
    customerName,
    customerPhone,
    customerEmail: customerEmail || "",
    deliveryAddress,
    items,
    totalPrice: Number(totalPrice) || 0,
    deliveryFee: Number(deliveryFee) || 2000,
    riderName: "",
    riderStatus: "pending",
    status: "pending",
    specialInstructions: specialInstructions || "",
    preferredTime: preferredTime || "",
    createdAt: now,
    updatedAt: now,
  });

  const store = await getStoreById(storeId);
  if (store) {
    await updateStore(storeId, { totalOrders: store.totalOrders + 1 });
  }

  return Response.json(order, { status: 201 });
}

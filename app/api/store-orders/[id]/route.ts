import { NextRequest } from "next/server";
import { getStoreOrderById, updateStoreOrder } from "@/app/lib/db";
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
  return Response.json(updated);
}

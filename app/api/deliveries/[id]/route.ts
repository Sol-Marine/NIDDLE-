import { NextRequest } from "next/server";
import { getDeliveryById, updateDelivery } from "@/app/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const delivery = getDeliveryById(id);
  if (!delivery) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(delivery);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const updated = updateDelivery(id, body);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

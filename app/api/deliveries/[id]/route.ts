import { NextRequest } from "next/server";
import { getDeliveryById, updateDelivery } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

const ADMIN_ONLY_FIELDS = ["riderId", "riderName", "status"];

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const delivery = await getDeliveryById(id);
  if (!delivery) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(delivery);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const d = await getDeliveryById(id);
  if (!d) return Response.json({ error: "Not found" }, { status: 404 });

  const isAdmin = user.role === "admin";
  const isSender = d.senderPhone === user.phone;
  const isRecipient = d.recipientPhone === user.phone;
  if (!isAdmin && !isSender && !isRecipient) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const ALLOWED_FIELDS = ["proofNote", "receivedBy", "negotiationStatus", "price"];
  if (!isAdmin) {
    const disallowed = Object.keys(body).filter((f) => !ALLOWED_FIELDS.includes(f));
    if (disallowed.length > 0) {
      return Response.json({ error: "Admin access required to modify this field" }, { status: 403 });
    }
  }

  const updated = await updateDelivery(id, body);
  return Response.json(updated);
}

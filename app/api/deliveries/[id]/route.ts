import { NextRequest } from "next/server";
import { getDeliveryById, updateDelivery } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

const ADMIN_ONLY_FIELDS = ["riderId", "riderName", "status"];

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const delivery = getDeliveryById(id);
  if (!delivery) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(delivery);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const isAdmin = user.role === "admin";
  const hasAdminFields = ADMIN_ONLY_FIELDS.some((f) => f in body);
  if (hasAdminFields && !isAdmin) {
    return Response.json({ error: "Admin access required to modify this field" }, { status: 403 });
  }

  const updated = updateDelivery(id, body);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

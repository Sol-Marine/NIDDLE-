import { NextRequest } from "next/server";
import { updateAddress, deleteAddress, getAddresses } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userAddresses = await getAddresses(user.id);
  const owns = userAddresses.some((a) => a.id === id);
  if (!owns) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const updated = await updateAddress(id, body);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userAddresses = await getAddresses(user.id);
  const owns = userAddresses.some((a) => a.id === id);
  if (!owns) return Response.json({ error: "Forbidden" }, { status: 403 });

  const deleted = await deleteAddress(id);
  if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}

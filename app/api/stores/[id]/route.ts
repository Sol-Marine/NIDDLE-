import { NextRequest } from "next/server";
import { getStoreById, updateStore } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await getStoreById(id);
  if (!store) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(store);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const store = await getStoreById(id);
  if (!store) return Response.json({ error: "Not found" }, { status: 404 });

  if (store.ownerId !== user.id && user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updated = await updateStore(id, body);
  return Response.json(updated);
}

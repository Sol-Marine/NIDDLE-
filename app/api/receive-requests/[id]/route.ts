import { NextRequest } from "next/server";
import { getReceiveRequestById, updateReceiveRequest } from "@/app/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const req = getReceiveRequestById(id);
  if (!req) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(req);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const updated = updateReceiveRequest(id, body);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

import { NextRequest } from "next/server";
import { getStoreItems, createStoreItem } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const items = await getStoreItems(id);
  return Response.json(items);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { name, description, price, category, image } = body;

  if (!name || price === undefined) {
    return Response.json({ error: "Name and price are required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const item = await createStoreItem({
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    storeId: id,
    name,
    description: description || "",
    price: Number(price),
    category: category || "",
    image: image || "",
    isAvailable: true,
    createdAt: now,
  });

  return Response.json(item, { status: 201 });
}

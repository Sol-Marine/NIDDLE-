import { NextRequest } from "next/server";
import { getStores, createStore } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

export async function GET() {
  const stores = await getStores();
  return Response.json(stores);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, description, category, address, phone, email, openingHours } = body;

  if (!name || !category || !address || !phone || !email) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const store = await createStore({
    id: `store-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ownerId: user.id,
    name,
    description: description || "",
    category,
    logo: "",
    cover: "",
    address,
    phone,
    email,
    rating: 0,
    totalOrders: 0,
    isActive: true,
    openingHours: openingHours || "9:00 AM - 6:00 PM",
    createdAt: now,
  });

  return Response.json(store, { status: 201 });
}

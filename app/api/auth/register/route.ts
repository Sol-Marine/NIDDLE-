import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createUser, getUserByEmail, createStore, supabase } from "@/app/lib/db";
import { rateLimit } from "@/app/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(`register:${ip}`, 3, 60_000)) {
    return Response.json({ error: "Too many attempts. Try again in 1 minute." }, { status: 429 });
  }

  const body = await request.json();
  const {
    name, email, password, role,
    storeName, storeDescription, storeCategory, storeAddress, storePhone, storeEmail, storeHours,
    phone, vehicleType, city,
  } = body;

  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const userRole = role === "store" ? "store" : role === "rider" ? "rider" : "customer";

  const user = await createUser({
    id: "user-" + crypto.randomUUID(),
    name: name || email.split("@")[0],
    email,
    password: hashed,
    phone: phone || "",
    role: userRole,
    emailVerified: false,
    emailVerifyToken: verifyToken,
    createdAt: new Date().toISOString(),
  });

  if (userRole === "store" && storeName && storeCategory) {
    const now = new Date().toISOString();
    await createStore({
      id: `store-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ownerId: user.id,
      name: storeName,
      description: storeDescription || "",
      category: storeCategory,
      logo: "",
      cover: "",
      address: storeAddress || "",
      phone: storePhone || "",
      email: storeEmail || email,
      rating: 0,
      totalOrders: 0,
      isActive: true,
      openingHours: storeHours || "9:00 AM - 6:00 PM",
      createdAt: now,
      isFeatured: false,
      bannerUrl: "",
      promoText: "",
      total_orders: 0,
    });
  }

  if (userRole === "rider") {
    const maxId = await supabase.from("riders").select("id").order("id", { ascending: false }).limit(1);
    const nextId = (maxId.data?.[0]?.id ?? 4) + 1;

    await supabase.from("riders").insert({
      id: nextId,
      name: name || email.split("@")[0],
      rating: 5.0,
      rides: 0,
      badge: "New Rider",
      active: true,
      is_online: false,
      vehicle_type: vehicleType || "bicycle",
      lat: null,
      lng: null,
    });

    await supabase.from("rider_scores").insert({
      id: crypto.randomUUID(),
      rider_id: nextId,
      acceptance_rate: 100,
      cancellation_rate: 0,
      avg_delivery_time: 0,
      total_deliveries: 0,
      rating: 5.0,
      batch: 12,
      week_start: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await supabase.from("wallets").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      balance: 0,
      currency: "NGN",
      created_at: new Date().toISOString(),
    });
  }

  if (userRole === "customer") {
    await supabase.from("wallets").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      balance: 0,
      currency: "NGN",
      created_at: new Date().toISOString(),
    });
  }

  return Response.json({ ok: true, verifyToken, role: userRole }, { status: 201 });
}

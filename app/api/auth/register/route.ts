import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createUser, getUserByEmail, createStore } from "@/app/lib/db";
import { rateLimit } from "@/app/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(`register:${ip}`, 3, 60_000)) {
    return Response.json({ error: "Too many attempts. Try again in 1 minute." }, { status: 429 });
  }

  const { name, email, password, role, storeName, storeDescription, storeCategory, storeAddress, storePhone, storeEmail, storeHours } = await request.json();
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
  const userRole = role === "store" ? "store" : "customer";
  const user = await createUser({
    id: "user-" + crypto.randomUUID(),
    name: name || email.split("@")[0],
    email,
    password: hashed,
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
    });
  }

  return Response.json({ ok: true, verifyToken, role: userRole }, { status: 201 });
}

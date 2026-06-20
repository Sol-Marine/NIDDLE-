import { NextRequest } from "next/server";
import { getDeliveries, getDeliveriesByPhone, createDelivery } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";
import { rateLimit } from "@/app/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  const data = phone ? getDeliveriesByPhone(phone) : getDeliveries();
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimit(`delivery:${user.id}`, 10, 60_000)) {
    return Response.json({ error: "Too many deliveries. Slow down." }, { status: 429 });
  }

  const body = await request.json();

  const required = ["senderName", "recipientName", "pickupAddress", "deliveryAddress"];
  for (const field of required) {
    if (!body[field] || typeof body[field] !== "string" || body[field].trim() === "") {
      return Response.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const delivery = createDelivery(body);
  return Response.json(delivery, { status: 201 });
}

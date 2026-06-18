import { NextRequest } from "next/server";
import { getDeliveries, getDeliveriesByPhone, createDelivery } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  const data = phone ? getDeliveriesByPhone(phone) : getDeliveries();
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const delivery = createDelivery(body);
  return Response.json(delivery, { status: 201 });
}

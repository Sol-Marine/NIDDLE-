import { NextRequest } from "next/server";
import { getReceiveRequests, getReceiveRequestsByPhone, createReceiveRequest } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  const data = phone ? await getReceiveRequestsByPhone(phone) : await getReceiveRequests();
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const req = await createReceiveRequest(body);
  return Response.json(req, { status: 201 });
}

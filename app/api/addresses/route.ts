import { NextRequest } from "next/server";
import { getAddresses, createAddress } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(getAddresses(user.id));
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const addr = createAddress({ ...body, id: "addr-" + crypto.randomUUID(), userId: user.id });
  return Response.json(addr, { status: 201 });
}

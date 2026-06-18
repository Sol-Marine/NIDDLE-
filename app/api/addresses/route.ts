import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getAddresses, createAddress } from "@/app/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(getAddresses(session.value));
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const addr = createAddress({ ...body, id: "addr-" + Date.now(), userId: session.value });
  return Response.json(addr, { status: 201 });
}

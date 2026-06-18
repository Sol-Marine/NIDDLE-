import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getUserById, updateUser } from "@/app/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const user = getUserById(session.value);
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });
  const { password: _, ...safe } = user;
  return Response.json(safe);
}

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const updates = await request.json();
  const updated = updateUser(session.value, updates);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  const { password: _, ...safe } = updated;
  return Response.json(safe);
}

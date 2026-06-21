import { NextRequest } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import { updateUser } from "@/app/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { password: _, ...safe } = user;
  return Response.json(safe);
}

const ALLOWED_FIELDS = ["name", "phone", "avatar", "notifSettings"];

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const safeUpdates: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) {
      safeUpdates[key] = body[key];
    }
  }

  if (Object.keys(safeUpdates).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await updateUser(user.id, safeUpdates);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  const { password: _, ...safe } = updated;
  return Response.json(safe);
}

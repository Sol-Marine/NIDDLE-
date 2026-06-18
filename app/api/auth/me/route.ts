import { cookies } from "next/headers";
import { getUserById } from "@/app/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return Response.json({ user: null });
  const user = getUserById(session.value);
  if (!user) return Response.json({ user: null });
  return Response.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

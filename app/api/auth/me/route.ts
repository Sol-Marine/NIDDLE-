import { getSessionUser } from "@/app/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ user: null });
  return Response.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

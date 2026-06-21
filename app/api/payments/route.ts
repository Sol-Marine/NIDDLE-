import { cookies } from "next/headers";
import { getPayments } from "@/app/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await getPayments(session.value));
}

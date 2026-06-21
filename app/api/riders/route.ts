import { getRiders } from "@/app/lib/db";

export async function GET() {
  return Response.json(await getRiders());
}

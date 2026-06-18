import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }
  return Response.json({
    user: { name: email.split("@")[0], email },
    token: "mock-token-" + Date.now(),
  });
}

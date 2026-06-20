import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/app/lib/db";
import { signSession } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/login?error=google_cancelled", request.url));
  }

  try {
    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/login?error=google_token", request.url));
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!googleUser.email) {
      return NextResponse.redirect(new URL("/login?error=google_profile", request.url));
    }

    let user = getUserByEmail(googleUser.email);

    if (!user) {
      user = createUser({
        id: "user-" + crypto.randomUUID(),
        name: googleUser.name || googleUser.email.split("@")[0],
        email: googleUser.email,
        password: "google-oauth-no-password",
        avatar: googleUser.picture || "",
        role: "staff",
        createdAt: new Date().toISOString(),
      });
    }

    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.set("session", signSession(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400 * 7,
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_failed", request.url));
  }
}

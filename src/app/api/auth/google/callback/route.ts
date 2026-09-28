import { NextRequest, NextResponse } from "next/server";
import { callApi, type Session } from "@/shared/lib/admin-api";
import {
  GOOGLE_STATE_COOKIE,
  GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL,
  googleEnabled,
  googleRedirectUri,
} from "@/shared/lib/google";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
} from "@/shared/lib/session";

const failed = (request: NextRequest, reason: string) =>
  NextResponse.redirect(
    new URL(`/?signin=1&error=${encodeURIComponent(reason)}`, request.url),
  );

export const GET = async (request: NextRequest) => {
  if (!googleEnabled()) return failed(request, "google");

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return failed(request, "cancelled");

  const code = params.get("code");
  const state = params.get("state");
  const expected = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;

  // Same-value check, not just presence: without it anyone could hand this
  // endpoint a code obtained for a different site.
  if (!code || !state || !expected || state !== expected) {
    return failed(request, "state");
  }

  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: googleRedirectUri(request.nextUrl.origin),
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return failed(request, "token");

    const { access_token } = (await tokenRes.json()) as {
      access_token?: string;
    };
    if (!access_token) return failed(request, "token");

    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!profileRes.ok) return failed(request, "profile");

    const profile = (await profileRes.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };

    // An unverified address could belong to somebody else, and matching on it
    // would hand them that account.
    if (!profile.sub || !profile.email || profile.email_verified === false) {
      return failed(request, "unverified");
    }

    const session = await callApi<Session>("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        googleId: profile.sub,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture,
      }),
    });

    const next = state.slice(state.indexOf(":") + 1) || "/";
    const response = NextResponse.redirect(new URL(next, request.url));

    response.cookies.set(SESSION_COOKIE, await signSession(session.user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    response.cookies.delete(GOOGLE_STATE_COOKIE);

    return response;
  } catch {
    return failed(request, "google");
  }
};

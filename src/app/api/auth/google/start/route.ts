import { NextRequest, NextResponse } from "next/server";
import { publicOrigin, publicUrl } from "@/shared/lib/public-origin";
import {
  GOOGLE_AUTH_URL,
  GOOGLE_STATE_COOKIE,
  googleEnabled,
  googleRedirectUri,
} from "@/shared/lib/google";

export const GET = async (request: NextRequest) => {
  if (!googleEnabled()) {
    return NextResponse.redirect(publicUrl(request, "/?signin=1&error=google"));
  }

  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  // The state proves the callback belongs to a flow this site started. It
  // carries the destination too, so the browser never has to be trusted for it.
  const state = `${crypto.randomUUID()}:${safeNext}`;

  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  url.searchParams.set(
    "redirect_uri",
    googleRedirectUri(publicOrigin(request)),
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(url);
  response.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return response;
};

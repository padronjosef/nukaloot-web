import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_IDLE_SECONDS,
  shouldRenew,
  signSession,
  verifySession,
} from "@/shared/lib/session";

/** Everything here needs a session; the rest of the site does not. */
const GATED = ["/admin", "/account", "/api/admin", "/api/account"];

const isGated = (pathname: string) =>
  GATED.some((base) => pathname === base || pathname.startsWith(`${base}/`));

/**
 * Two jobs. It gates the private paths — an optimistic check only, since the
 * layouts and routes re-read the account from the database — and it keeps an
 * active session alive so that using the site never logs you out.
 */
export const proxy = async (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;
  const session = await verifySession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (!session) {
    if (!isGated(pathname)) return NextResponse.next();

    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    // Signing in is a modal, not a page, so send them home with it open and
    // remember where they were going.
    const home = new URL("/", request.url);
    home.searchParams.set("signin", "1");
    home.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(home);
  }

  const response = NextResponse.next();

  // Renewed here because a server component cannot set a cookie, and at most
  // once a day so concurrent requests do not fight over it. The sign-in time
  // is carried over untouched, which is what keeps the absolute limit real.
  if (shouldRenew(session)) {
    response.cookies.set(
      SESSION_COOKIE,
      await signSession(session.sub, session.startedAt),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_IDLE_SECONDS,
      },
    );
  }

  return response;
};

export const config = {
  // Every page and API route, so an ordinary visit keeps the session fresh —
  // but never static assets, which would be pure overhead.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};

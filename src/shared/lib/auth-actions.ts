"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminApiError, callApi, type Session } from "./admin-api";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
} from "./session";

export type LoginState = {
  error: string | null;
  ok: boolean;
  /** Set when the password was right but the address is still unconfirmed. */
  needsVerification?: string | null;
};

/**
 * Returns rather than redirects: the form lives in a modal, so the page it was
 * opened from is where the person should stay.
 */
export const login = async (
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> => {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password.", ok: false };
  }

  let session: Session;
  try {
    session = await callApi<Session>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    if (error instanceof AdminApiError) {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        return {
          error: "Confirm your email before signing in.",
          ok: false,
          needsVerification: email,
        };
      }
      if (error.status === 401) {
        return { error: "Invalid email or password.", ok: false };
      }
    }
    return {
      error: error instanceof Error ? error.message : "Could not sign you in.",
      ok: false,
    };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(session.user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return { error: null, ok: true };
};

export const logout = async (): Promise<void> => {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);

  // Revoked on the server first, so the cookie stops working even for whoever
  // copied it. Deleting it from this browser alone would leave that copy live
  // until it expired.
  if (session) {
    await callApi("/auth/revoke", {
      method: "POST",
      actorId: session.sub,
    }).catch(() => {
      // Signing out of this browser still has to happen.
    });
  }

  store.delete(SESSION_COOKIE);
  redirect("/");
};

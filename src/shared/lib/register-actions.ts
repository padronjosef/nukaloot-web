"use server";

import { headers } from "next/headers";
import { AdminApiError, callApi } from "./admin-api";

export type RegisterState = {
  error: string | null;
  /** Set once the message is on its way, so the form can say so. */
  sentTo: string | null;
};

/** Built from the incoming request so it works on localhost and in production. */
const verifyUrl = async (): Promise<string> => {
  const list = await headers();
  const host = list.get("host") ?? "localhost:3003";
  const proto = list.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}/verify`;
};

export const register = async (
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> => {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    return { error: "Enter your email and a password.", sentTo: null };
  }
  if (password.length < 10) {
    return { error: "Your password needs at least 10 characters.", sentTo: null };
  }

  try {
    await callApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name: name || undefined,
        verifyUrl: await verifyUrl(),
      }),
    });
  } catch (error) {
    return {
      error:
        error instanceof AdminApiError
          ? error.message
          : "Could not create your account.",
      sentTo: null,
    };
  }

  // The same answer whether the address was free or already taken, so this
  // cannot be used to find out who has an account here.
  return { error: null, sentTo: email };
};

export const resendVerification = async (email: string): Promise<boolean> => {
  try {
    await callApi("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email, verifyUrl: await verifyUrl() }),
    });
    return true;
  } catch {
    return false;
  }
};

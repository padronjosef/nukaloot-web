import { cookies } from "next/headers";
import { mintApiToken } from "./api-token";
import { SESSION_COOKIE, verifySession } from "./session";
import type {
  Permission,
  PublicSession,
  SessionUser,
} from "./session-types";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || "http://localhost:3002";

export type { Permission, UserRole } from "./session-types";
export type AdminUser = SessionUser;
export type Session = PublicSession;

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Lets a caller tell apart two refusals that share a status. */
    readonly code?: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

/**
 * Every call carries a freshly signed, short-lived bearer token. The API
 * verifies it on its own, so being inside the Docker network is not what
 * grants access — and `actorId` travels inside the signature, which is why
 * the API can trust who the call acts for.
 */
export const callApi = async <T>(
  path: string,
  init: RequestInit & { actorId?: string } = {},
): Promise<T> => {
  const { actorId, ...rest } = init;

  let res: Response;
  try {
    res = await fetch(`${INTERNAL_API_URL}/api${path}`, {
      ...rest,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await mintApiToken(actorId)}`,
        ...rest.headers,
      },
    });
  } catch {
    throw new AdminApiError("Could not reach the API.", 0);
  }

  if (res.status === 204) return undefined as T;

  const body = (await res.json().catch(() => null)) as
    | { message?: string | string[]; code?: string }
    | null;

  if (!res.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? `Request failed (${res.status})`);
    throw new AdminApiError(message, res.status, body?.code);
  }

  return body as T;
};

/** The signed-in user, re-read from the database on every call. */
export const getSession = async (): Promise<Session | null> => {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  try {
    return await callApi<Session>(
      `/auth/session/${session.sub}?startedAt=${session.startedAt}`,
    );
  } catch {
    return null;
  }
};

export const requireSession = async (): Promise<Session> => {
  const session = await getSession();
  if (!session) throw new AdminApiError("Not signed in", 401);
  return session;
};

export const requirePermission = async (
  permission: Permission,
): Promise<Session> => {
  const session = await requireSession();
  if (!session.permissions.includes(permission)) {
    throw new AdminApiError(`Requires ${permission}`, 403);
  }
  return session;
};

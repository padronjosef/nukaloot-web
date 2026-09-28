// No `server-only` marker here: proxy.ts runs this outside the server bundle.
export const SESSION_COOKIE = "nukaloot_session";

/** How long a cookie survives without being used. Renewal resets it. */
export const SESSION_IDLE_SECONDS = 60 * 60 * 24 * 7;
/** How long a sign-in lasts no matter how active you are. */
export const SESSION_ABSOLUTE_SECONDS = 60 * 60 * 24 * 30;
/** Renewed at most this often, rather than on every single request. */
export const SESSION_RENEW_AFTER_SECONDS = 60 * 60 * 24;

export const SESSION_MAX_AGE = SESSION_IDLE_SECONDS;

const encoder = new TextEncoder();

const toBase64Url = (bytes: ArrayBuffer | Uint8Array): string => {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Buffer.from(view).toString("base64url");
};

const secretKey = async (): Promise<CryptoKey> => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set to at least 32 characters",
    );
  }

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
};

type SessionPayload = {
  sub: string;
  /** When this cookie was minted. Moves forward on every renewal. */
  iat: number;
  /** When the sign-in happened. Carried unchanged through renewals. */
  sat: number;
  exp: number;
};

export type Session = { sub: string; iat: number; startedAt: number };

/**
 * A signed cookie, not a JWT: nothing here is read by another service, so an
 * HMAC over the payload is the whole requirement. Whether the account still
 * exists and is active is re-checked against the API on every request.
 */
export const signSession = async (
  userId: string,
  startedAt?: number,
): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  // `sat` is what signing out is measured against, and renewal never moves
  // it — so a copied cookie cannot outlive a sign-out by being used.
  const payload: SessionPayload = {
    sub: userId,
    iat: now,
    sat: startedAt ?? now,
    exp: now + SESSION_IDLE_SECONDS,
  };

  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await secretKey(),
    encoder.encode(body),
  );

  return `${body}.${toBase64Url(signature)}`;
};

export const verifySession = async (
  token: string | undefined,
): Promise<Session | null> => {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await secretKey(),
      Buffer.from(signature, "base64url"),
      encoder.encode(body),
    );
    if (!valid) return null;

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (!payload.sub || payload.exp * 1000 < Date.now()) return null;

    const startedAt = payload.sat ?? payload.iat ?? 0;
    // The hard ceiling: past this, activity does not help.
    const now = Math.floor(Date.now() / 1000);
    if (now - startedAt > SESSION_ABSOLUTE_SECONDS) return null;

    return { sub: payload.sub, iat: payload.iat ?? 0, startedAt };
  } catch {
    return null;
  }
};

/** True once the cookie is old enough to be worth re-issuing. */
export const shouldRenew = (session: Session): boolean =>
  Math.floor(Date.now() / 1000) - session.iat > SESSION_RENEW_AFTER_SECONDS;

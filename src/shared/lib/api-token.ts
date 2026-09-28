const ISSUER = "nukaloot-web";
/** Short on purpose: these are minted per call, so a leaked one dies fast. */
const TTL_SECONDS = 120;

const encoder = new TextEncoder();

const base64url = (bytes: ArrayBuffer | Uint8Array | string): string => {
  if (typeof bytes === "string") return Buffer.from(bytes).toString("base64url");
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Buffer.from(view).toString("base64url");
};

const key = async (): Promise<CryptoKey> => {
  const secret = process.env.API_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("API_JWT_SECRET must be set to at least 32 characters");
  }

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
};

/**
 * The bearer token the API checks. When `sub` is given the call acts for that
 * account, and because it is inside the signature the API can trust it —
 * unlike an id passed beside a static shared secret.
 */
export const mintApiToken = async (sub?: string): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ iss: ISSUER, sub, iat: now, exp: now + TTL_SECONDS }),
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    await key(),
    encoder.encode(`${header}.${payload}`),
  );

  return `${header}.${payload}.${base64url(signature)}`;
};

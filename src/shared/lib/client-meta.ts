import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./session";

/**
 * Cloudflare terminates TLS in front of nginx, so the only trustworthy source
 * for the visitor's IP and country is what it adds to the request. Everything
 * else here is a fallback for running without the proxy (local dev).
 */
export const clientMetaHeaders = async (
  request: NextRequest,
): Promise<Record<string, string>> => {
  const h = request.headers;

  const ip =
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "";

  const meta: Record<string, string> = {};

  if (ip) meta["x-client-ip"] = ip;

  const country = h.get("cf-ipcountry");
  if (country && country !== "XX") meta["x-client-country"] = country;

  const city = h.get("cf-ipcity");
  if (city) meta["x-client-city"] = city;

  const region = h.get("cf-region");
  if (region) meta["x-client-region"] = region;

  const userAgent = h.get("user-agent");
  if (userAgent) meta["x-client-user-agent"] = userAgent;

  const referer = h.get("referer");
  if (referer) meta["x-client-referer"] = referer;

  // Taken from the signed cookie, not from anything the browser could set, so
  // a search cannot be attributed to someone else.
  const session = await verifySession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  if (session) meta["x-client-user-id"] = session.sub;

  return meta;
};

/**
 * The address the browser used, which behind a proxy is not the one the
 * container sees.
 *
 * Next builds `request.url` from the internal listen address, so in production
 * every absolute URL made from it pointed at http://localhost:3001 and sent
 * people there. The sign-in error redirect did exactly that.
 *
 * `WEB_APP_DOMAIN` wins when it is set, because it is configuration rather
 * than something a caller can put in a header: `Host` reaches us from the
 * client through nginx, and trusting it to build a redirect is how an open
 * redirect happens. The headers are the fallback for local development, where
 * there is no proxy and nothing to spoof.
 */
export const publicOrigin = (request: {
  headers: { get: (name: string) => string | null };
  nextUrl: { origin: string; protocol: string };
}): string => {
  const configured = process.env.WEB_APP_DOMAIN?.trim();
  if (configured) {
    return configured.startsWith("http") ? configured : `https://${configured}`;
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return request.nextUrl.origin;

  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");

  return `${proto}://${host}`;
};

/** An absolute URL on this site, for the places that cannot take a relative one. */
export const publicUrl = (
  request: Parameters<typeof publicOrigin>[0],
  path: string,
): URL => new URL(path, publicOrigin(request));

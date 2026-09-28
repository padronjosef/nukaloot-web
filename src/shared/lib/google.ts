export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_URL =
  "https://openidconnect.googleapis.com/v1/userinfo";

export const GOOGLE_STATE_COOKIE = "nukaloot_oauth_state";

/** Google is offered only when it is actually configured. */
export const googleEnabled = (): boolean =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

/**
 * Must match one of the redirect URIs registered on the Google client exactly,
 * so it is derived from the request rather than guessed.
 */
export const googleRedirectUri = (origin: string): string =>
  process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;

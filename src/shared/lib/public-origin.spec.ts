import { afterEach, describe, expect, it } from "vitest";
import { publicOrigin, publicUrl } from "./public-origin";

/**
 * Behind nginx, `request.url` is the container's own address, so every
 * absolute URL built from it pointed at http://localhost:3001 and sent people
 * there. The sign-in error redirect in production did exactly that.
 */
const request = (headers: Record<string, string>, origin = "http://localhost:3001") => ({
  headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
  nextUrl: { origin, protocol: new URL(origin).protocol },
});

describe("publicOrigin", () => {
  afterEach(() => {
    delete process.env.WEB_APP_DOMAIN;
  });

  it("uses the configured domain", () => {
    process.env.WEB_APP_DOMAIN = "nukaloot.com";
    expect(publicOrigin(request({}))).toBe("https://nukaloot.com");
  });

  it("takes the configured domain with its scheme when it has one", () => {
    process.env.WEB_APP_DOMAIN = "http://staging.nukaloot.com";
    expect(publicOrigin(request({}))).toBe("http://staging.nukaloot.com");
  });

  it("falls back to the forwarded headers when nothing is configured", () => {
    expect(
      publicOrigin(
        request({ host: "nukaloot.com", "x-forwarded-proto": "https" }),
      ),
    ).toBe("https://nukaloot.com");
  });

  it("works in development, where there is no proxy at all", () => {
    expect(publicOrigin(request({ host: "localhost:3003" }))).toBe(
      "http://localhost:3003",
    );
  });

  describe("what it must not do", () => {
    it("never hands back the container's own address when a domain is set", () => {
      // This is the bug: the internal origin reaching a browser.
      process.env.WEB_APP_DOMAIN = "nukaloot.com";
      expect(publicOrigin(request({}, "http://localhost:3001"))).not.toContain(
        "localhost",
      );
    });

    it("ignores a Host header a caller made up", () => {
      // `Host` arrives from the client through nginx. Trusting it to build a
      // redirect is how somebody gets sent to a site they did not ask for.
      process.env.WEB_APP_DOMAIN = "nukaloot.com";
      expect(
        publicOrigin(
          request({ host: "evil.test", "x-forwarded-host": "evil.test" }),
        ),
      ).toBe("https://nukaloot.com");
    });

    it("treats a blank setting as no setting rather than as an origin", () => {
      process.env.WEB_APP_DOMAIN = "   ";
      expect(publicOrigin(request({ host: "nukaloot.com" }))).toBe(
        "http://nukaloot.com",
      );
    });
  });
});

describe("publicUrl", () => {
  afterEach(() => {
    delete process.env.WEB_APP_DOMAIN;
  });

  it("builds a path on this site", () => {
    process.env.WEB_APP_DOMAIN = "nukaloot.com";
    expect(publicUrl(request({}), "/?signin=1&error=google").toString()).toBe(
      "https://nukaloot.com/?signin=1&error=google",
    );
  });

  it("keeps a destination on this site rather than following it elsewhere", () => {
    // `next` comes off the query string, so a full URL in it must not become
    // the redirect target.
    process.env.WEB_APP_DOMAIN = "nukaloot.com";
    expect(publicUrl(request({}), "/account").origin).toBe(
      "https://nukaloot.com",
    );
  });
});

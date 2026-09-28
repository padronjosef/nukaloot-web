import { describe, expect, it } from "vitest";
import { cleanPlatformChoice, PLATFORMS, toPlatform } from "./types";

describe("toPlatform", () => {
  it.each(PLATFORMS)("keeps %s", (platform) => {
    expect(toPlatform(platform)).toBe(platform);
  });

  describe("what it must not let through", () => {
    // Anything that is not a known platform matches no filter, so a price
    // carrying it would vanish from the results entirely. That is the failure
    // this guards: the column shipped with a default of 'unknown' and 127 rows
    // disappeared from the page.
    it.each([
      ["null", null],
      ["undefined", undefined],
      ["empty", ""],
      ["the old column default", "unknown"],
      ["a platform from a newer API", "steamdeck"],
      ["whitespace", "  "],
    ] as const)("reads %s as pc rather than dropping the price", (_l, value) => {
      expect(toPlatform(value)).toBe("pc");
    });

    it("does not accept a differently-cased platform as itself", () => {
      // The API is the one that normalises. If casing ever drifts we want the
      // price shown as PC, not silently labelled PlayStation.
      expect(toPlatform("PlayStation")).toBe("pc");
      expect(toPlatform("PC")).toBe("pc");
    });

    it("refuses a value that only looks like a platform", () => {
      expect(toPlatform("pc-vr")).toBe("pc");
      expect(toPlatform("xbox360")).toBe("pc");
    });
  });
});

describe("cleanPlatformChoice", () => {
  it("keeps the platforms it knows, once each", () => {
    expect(cleanPlatformChoice(["pc", "xbox", "pc"])).toEqual(["pc", "xbox"]);
  });

  it("accepts the casing and padding a form might send", () => {
    expect(cleanPlatformChoice([" PlayStation ", "XBOX"])).toEqual([
      "playstation",
      "xbox",
    ]);
  });

  describe("what it must refuse", () => {
    it.each([
      ["nothing", undefined],
      ["null", null],
      ["an empty list", []],
      ["a string rather than a list", "pc"],
      ["a list of junk", [1, null, {}, true]],
      ["platforms it does not know", ["ps5", "dreamcast"]],
    ])("returns nothing for %s, so the caller can refuse", (_label, input) => {
      expect(cleanPlatformChoice(input)).toEqual([]);
    });

    it("never falls back to every platform", () => {
      // An empty preference that meant "all" would quote console keys to
      // somebody who only owns a PC. Empty has to mean "ask again".
      expect(cleanPlatformChoice([])).toEqual([]);
    });

    it("does not turn an unknown entry into PC beside a real choice", () => {
      // Dropping and coercing look identical for ['ps5'] alone. They differ
      // here, and coercing would silently add PC to a console-only choice.
      expect(cleanPlatformChoice(["ps5", "xbox"])).toEqual(["xbox"]);
    });
  });
});

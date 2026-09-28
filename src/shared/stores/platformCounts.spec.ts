import { describe, expect, it } from "vitest";
import { platformCounts } from "./platformCounts";
import type { PriceResult } from "../lib/stores";

const price = (platform: unknown): PriceResult =>
  ({ platform }) as unknown as PriceResult;

describe("platformCounts", () => {
  it("counts each platform", () => {
    expect(
      platformCounts([price("pc"), price("pc"), price("playstation")]),
    ).toEqual({ pc: 2, playstation: 1, xbox: 0, nintendo: 0 });
  });

  it("always reports every platform, including the empty ones", () => {
    // The zeros are what keeps the control on screen. Returning only the
    // platforms found would hide the filter on a PC-only search, which is
    // most of them.
    expect(Object.keys(platformCounts([price("pc")])).sort()).toEqual([
      "nintendo",
      "pc",
      "playstation",
      "xbox",
    ]);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["the old column default", "unknown"],
    ["an unknown platform", "steamdeck"],
  ])("counts a listing stored as %s under PC", (_label, stored) => {
    // Same coercion the filter itself uses, or the counts would disagree with
    // what the page shows: a "0" beside a list that clearly has results.
    expect(platformCounts([price(stored)]).pc).toBe(1);
  });

  it("returns all zeros for no results", () => {
    expect(platformCounts([])).toEqual({
      pc: 0,
      playstation: 0,
      xbox: 0,
      nintendo: 0,
    });
    expect(platformCounts(undefined)).toEqual({
      pc: 0,
      playstation: 0,
      xbox: 0,
      nintendo: 0,
    });
    expect(platformCounts(null)).toEqual({
      pc: 0,
      playstation: 0,
      xbox: 0,
      nintendo: 0,
    });
  });

  it("does not share one count object between calls", () => {
    // A module-level object would accumulate across searches and show counts
    // from the previous game.
    const first = platformCounts([price("pc")]);
    const second = platformCounts([price("xbox")]);
    expect(first.pc).toBe(1);
    expect(second.pc).toBe(0);
  });
});

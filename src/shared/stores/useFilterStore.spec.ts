import { beforeEach, describe, expect, it } from "vitest";
import { useFilterStore } from "./useFilterStore";
import type { Platform } from "../lib/stores/types";

const platforms = () => [...useFilterStore.getState().selectedPlatforms];
const toggle = (platform: Platform) =>
  useFilterStore.getState().togglePlatform(platform);

describe("togglePlatform", () => {
  beforeEach(() => {
    useFilterStore.setState({ selectedPlatforms: new Set<Platform>(["pc"]) });
  });

  it("starts on PC, which is what the catalogue has always shown", () => {
    expect(platforms()).toEqual(["pc"]);
  });

  it("adds and removes a platform", () => {
    toggle("playstation");
    expect(platforms().sort()).toEqual(["pc", "playstation"]);
    toggle("playstation");
    expect(platforms()).toEqual(["pc"]);
  });

  describe("what it must refuse", () => {
    it("will not turn off the last platform", () => {
      // An empty selection matches no price, so the page would go blank and
      // read as broken with no obvious way back.
      toggle("pc");
      expect(platforms()).toEqual(["pc"]);
    });

    it("will not empty the selection one platform at a time", () => {
      toggle("xbox");
      toggle("pc");
      expect(platforms()).toEqual(["xbox"]);
      toggle("xbox");
      expect(platforms()).toEqual(["xbox"]);
    });

    it("leaves the state object untouched when it refuses", () => {
      // Returning a fresh empty Set would still re-render every subscriber for
      // a change that did not happen.
      const before = useFilterStore.getState().selectedPlatforms;
      toggle("pc");
      expect(useFilterStore.getState().selectedPlatforms).toBe(before);
    });
  });

  it("does not mutate the previous Set", () => {
    // Zustand compares by reference; mutating in place would skip the render.
    const before = useFilterStore.getState().selectedPlatforms;
    toggle("nintendo");
    expect(before.has("nintendo")).toBe(false);
    expect(useFilterStore.getState().selectedPlatforms).not.toBe(before);
  });
});

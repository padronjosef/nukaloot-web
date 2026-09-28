import { describe, expect, it } from "vitest";
import { cheapestPerGame, matchesFilters, storeNameOf } from "./filterPrices";
import type { PriceFilters } from "./filterPrices";
import type { PriceResult } from "../lib/stores";
import type { Platform } from "../lib/stores/types";

const price = (over: Partial<PriceResult> = {}): PriceResult => ({
  id: "1",
  price: 10,
  currency: "USD",
  productUrl: "https://example.test/x",
  gameName: "Elden Ring",
  gameType: "game",
  platform: "pc",
  imageUrl: "",
  backgroundUrl: "",
  releaseDate: "",
  storeName: "Kinguin",
  ...over,
});

const filters = (over: Partial<PriceFilters> = {}): PriceFilters => ({
  selectedTypes: ["game", "bundle", "dlc", "other"],
  allTypes: true,
  gameFilter: "all",
  selectedPlatforms: new Set<Platform>(["pc"]),
  ...over,
});

describe("storeNameOf", () => {
  it("prefers the nested store, falls back to the flat name", () => {
    expect(
      storeNameOf(price({ store: { name: "Eneba", url: "" }, storeName: "x" })),
    ).toBe("Eneba");
    expect(storeNameOf(price({ store: undefined }))).toBe("Kinguin");
  });

  it("returns an empty name rather than throwing when a scraper sends neither", () => {
    // An empty name matches no selected store, which hides the price — but a
    // thrown TypeError would take the whole result list with it.
    expect(storeNameOf(price({ store: undefined, storeName: undefined }))).toBe(
      "",
    );
  });
});

describe("matchesFilters", () => {
  it("keeps a PC price while PC is selected", () => {
    expect(matchesFilters(price(), filters())).toBe(true);
  });

  describe("platform", () => {
    it("drops a console price the user did not ask for", () => {
      // The whole point of the filter: somebody shopping for PC must not be
      // offered a PS5 key as the cheapest option.
      expect(matchesFilters(price({ platform: "playstation" }), filters())).toBe(
        false,
      );
    });

    it("keeps a price whose platform this bundle does not recognise", () => {
      // Regression: 'unknown' is not null, so a `?? 'pc'` default missed it and
      // the price matched nothing.
      expect(matchesFilters(price({ platform: "unknown" }), filters())).toBe(
        true,
      );
      expect(matchesFilters(price({ platform: null }), filters())).toBe(true);
    });

    it("drops everything when no platform is selected", () => {
      // Never reachable through togglePlatform, and that is exactly why the
      // store has to keep enforcing it — see useFilterStore.spec.ts.
      expect(
        matchesFilters(price(), filters({ selectedPlatforms: new Set() })),
      ).toBe(false);
    });
  });

  describe("type", () => {
    it("drops a type that is not selected", () => {
      expect(
        matchesFilters(
          price({ gameType: "dlc" }),
          filters({ allTypes: false, selectedTypes: ["game"] }),
        ),
      ).toBe(false);
    });

    it("ignores the selection entirely when allTypes is set", () => {
      expect(
        matchesFilters(
          price({ gameType: "dlc" }),
          filters({ allTypes: true, selectedTypes: [] }),
        ),
      ).toBe(true);
    });

    it("drops an unexpected gameType instead of showing it under every filter", () => {
      expect(
        matchesFilters(
          price({ gameType: "soundtrack" }),
          filters({ allTypes: false, selectedTypes: ["game", "dlc"] }),
        ),
      ).toBe(false);
    });
  });

  describe("game", () => {
    it("drops a different game when one is pinned", () => {
      expect(
        matchesFilters(
          price({ gameName: "Hollow Knight" }),
          filters({ gameFilter: "Elden Ring" }),
        ),
      ).toBe(false);
    });

    it("matches the pinned name exactly, not loosely", () => {
      // "all" is the sentinel for no filter; a game genuinely called "all"
      // would be the only thing this gets wrong, and none exists.
      expect(
        matchesFilters(
          price({ gameName: "Elden Ring Deluxe" }),
          filters({ gameFilter: "Elden Ring" }),
        ),
      ).toBe(false);
    });
  });

  it("requires every filter at once, not any of them", () => {
    // A price that passes the game check but fails the platform check must
    // still be dropped.
    expect(
      matchesFilters(
        price({ platform: "xbox" }),
        filters({ gameFilter: "Elden Ring" }),
      ),
    ).toBe(false);
  });
});

describe("cheapestPerGame", () => {
  it("keeps the cheapest listing of each game", () => {
    const cheap = price({ id: "cheap", price: 5 });
    const dear = price({ id: "dear", price: 50 });
    expect(cheapestPerGame([dear, cheap]).map((p) => p.id)).toEqual(["cheap"]);
  });

  it("compares numerically when the API sends prices as strings", () => {
    // A string compare would rank "10.00" below "9.99" and quote the wrong
    // price on the card.
    const nine = price({ id: "nine", price: "9.99" as unknown as number });
    const ten = price({ id: "ten", price: "10.00" as unknown as number });
    expect(cheapestPerGame([ten, nine]).map((p) => p.id)).toEqual(["nine"]);
  });

  it("does not let a cheap DLC hide the base game", () => {
    const base = price({ id: "base", price: 40, gameType: "game" });
    const dlc = price({ id: "dlc", price: 2, gameType: "dlc" });
    expect(cheapestPerGame([base, dlc]).map((p) => p.id).sort()).toEqual([
      "base",
      "dlc",
    ]);
  });

  it("keeps the first of two listings at the same price", () => {
    const first = price({ id: "first", price: 10 });
    const second = price({ id: "second", price: 10 });
    expect(cheapestPerGame([first, second]).map((p) => p.id)).toEqual(["first"]);
  });

  it("never quotes a price that is not a number", () => {
    // NaN loses every comparison, so a broken row that arrives first used to
    // sit there as the headline price and never be beaten.
    const broken = price({ id: "broken", price: "n/a" as unknown as number });
    const real = price({ id: "real", price: 30 });
    expect(cheapestPerGame([broken, real]).map((p) => p.id)).toEqual(["real"]);
    expect(cheapestPerGame([real, broken]).map((p) => p.id)).toEqual(["real"]);
  });

  it("does not read a missing price as free", () => {
    // Number(null) and Number("") are both 0, which would quote a $40 game at
    // $0.00 and send the user to a store to find out.
    const missing = price({ id: "missing", price: null as unknown as number });
    const empty = price({ id: "empty", price: "" as unknown as number });
    const real = price({ id: "real", price: 40 });
    expect(cheapestPerGame([missing, real]).map((p) => p.id)).toEqual(["real"]);
    expect(cheapestPerGame([empty, real]).map((p) => p.id)).toEqual(["real"]);
  });

  it("still shows a game whose every listing is broken", () => {
    // Dropping it would leave a game the search found missing from the page
    // with no explanation.
    const broken = price({ id: "broken", price: "n/a" as unknown as number });
    const alsoBroken = price({
      id: "also",
      price: undefined as unknown as number,
    });
    expect(cheapestPerGame([broken, alsoBroken]).map((p) => p.id)).toEqual([
      "broken",
    ]);
  });

  it("returns nothing for nothing", () => {
    expect(cheapestPerGame([])).toEqual([]);
  });
});

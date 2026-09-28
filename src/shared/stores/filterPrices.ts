import type { PriceResult } from "../lib/stores";
import type { Platform } from "../lib/stores/types";
import { toPlatform } from "../lib/stores/types";

export type PriceFilters = {
  /** Which gameTypes to keep. Ignored when `allTypes` is set. */
  selectedTypes: string[];
  allTypes: boolean;
  /** A game name, or "all". */
  gameFilter: string;
  selectedPlatforms: Set<Platform>;
};

/** Scrapers fill one field or the other, never reliably both. */
export const storeNameOf = (p: PriceResult): string =>
  p.store?.name || p.storeName || "";

/**
 * Every filter except the store, which the results list and the "other stores"
 * count read in opposite directions. Kept in one place so those two can never
 * drift into disagreeing about the same price.
 */
export const matchesFilters = (p: PriceResult, f: PriceFilters): boolean => {
  if (!f.allTypes && !f.selectedTypes.includes(p.gameType)) return false;
  if (!f.selectedPlatforms.has(toPlatform(p.platform))) return false;
  if (f.gameFilter !== "all" && p.gameName !== f.gameFilter) return false;
  return true;
};

/**
 * `Number(null)` and `Number("")` are both 0, which would read as a free game
 * and win every comparison. Absent is not zero.
 */
const amountOf = (value: unknown): number =>
  value === null || value === undefined || value === "" ? NaN : Number(value);

/**
 * One row per game, the cheapest of its listings. Grouped by name *and* type so
 * a $2 DLC never hides the base game it belongs to.
 */
export const cheapestPerGame = (prices: PriceResult[]): PriceResult[] => [
  ...prices
    .reduce((acc, p) => {
      const key = `${p.gameName}::${p.gameType}`;
      const current = acc.get(key);
      if (!current) {
        acc.set(key, p);
        return acc;
      }
      // Numeric compare: prices arrive as strings often enough that a string
      // compare would rank "10.00" below "9.99".
      const value = amountOf(p.price);
      const best = amountOf(current.price);
      // A price that is not a number loses every comparison, so without this
      // it would sit there as the headline price and never be beaten. A real
      // price always displaces it; a game whose listings are all broken still
      // keeps one row rather than vanishing.
      if (!Number.isFinite(value)) return acc;
      if (!Number.isFinite(best) || value < best) acc.set(key, p);
      return acc;
    }, new Map<string, PriceResult>())
    .values(),
];

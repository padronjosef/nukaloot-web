import type { PriceResult } from "../lib/stores";
import type { Platform } from "../lib/stores/types";
import { PLATFORMS, toPlatform } from "../lib/stores/types";

export type PlatformCounts = Record<Platform, number>;

/**
 * How many listings this search turned up per platform, including the zeros.
 *
 * The zeros are the point: the filter shows every platform all the time, so a
 * search that only found PC keys still says so out loud instead of hiding the
 * control. A control that appears and disappears depending on the results
 * reads as the site having lost the feature.
 */
export const platformCounts = (
  prices: PriceResult[] | undefined | null,
): PlatformCounts => {
  const counts = Object.fromEntries(
    PLATFORMS.map((platform) => [platform, 0]),
  ) as PlatformCounts;

  for (const price of prices ?? []) counts[toPlatform(price.platform)] += 1;

  return counts;
};

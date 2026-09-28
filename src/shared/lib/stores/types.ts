export const PLATFORMS = ['pc', 'playstation', 'xbox', 'nintendo'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  pc: 'PC',
  playstation: 'PlayStation',
  xbox: 'Xbox',
  nintendo: 'Nintendo',
};

/**
 * Anything the API sends that is not a platform we know — an older row saved
 * before the column existed, a value from a newer API than this bundle — reads
 * as PC. A listing that matches no filter would vanish from the results
 * instead, and a missing price is worse than one labelled loosely.
 */
export const toPlatform = (value: string | null | undefined): Platform =>
  PLATFORMS.includes(value as Platform) ? (value as Platform) : 'pc';

/**
 * Cleans a submitted platform preference. Unknown entries are dropped rather
 * than coerced to PC: `toPlatform` has to land a *price* somewhere, but a
 * preference saying "ps5" must not quietly become "show me PC". Returns an
 * empty list when nothing survives, so the caller refuses the request instead
 * of storing a filter that matches nothing — or, worse, everything.
 */
export const cleanPlatformChoice = (value: unknown): Platform[] => {
  const list = Array.isArray(value) ? value : [];
  const seen = new Set<Platform>();

  for (const entry of list) {
    if (typeof entry !== "string") continue;
    const platform = entry.trim().toLowerCase();
    if (PLATFORMS.includes(platform as Platform)) {
      seen.add(platform as Platform);
    }
  }

  return [...seen];
};

export type TypeFilter = "all" | "game" | "dlc" | "bundle" | "other";

export type ViewMode = "grid" | "list";

export type CurrencyCode =
  | "USD"
  | "EUR"
  | "COP"
  | "GBP"
  | "BRL"
  | "MXN"
  | "ARS"
  | "CLP"
  | "PEN"
  | "JPY"
  | "CAD"
  | "AUD";

export type PriceResult = {
  id: string;
  price: number;
  originalPrice?: number;
  currency: string;
  productUrl: string;
  gameName: string;
  gameType: string;
  /**
   * Which machine the key is for. Read it through `toPlatform` — the API is a
   * separate deploy and may send a value this bundle does not know.
   */
  platform?: string | null;
  imageUrl: string;
  backgroundUrl: string;
  releaseDate: string;
  storeName?: string;
  store?: { name: string; url: string };
  scrapedAt?: string;
}

export type SearchResponse = {
  game: { name: string; slug: string };
  prices: PriceResult[];
}

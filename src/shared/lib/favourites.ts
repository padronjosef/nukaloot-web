export type FavouriteSource = "manual" | "steam";

export type FavouriteItem = {
  gameId: string;
  name: string;
  slug: string;
  coverUrl: string | null;
  addedAt: string;
  source: FavouriteSource;
  /** Whether it feeds the tracker. Saving is free; watching costs a scrape. */
  tracked: boolean;
  priceWhenAdded: number | null;
  bestPrice: number | null;
  currency: string | null;
  storeName: string | null;
  productUrl: string | null;
  scrapedAt: string | null;
  /**
   * Which machine that price is for. Null when there is no price. Read it
   * through `toPlatform`: the API is a separate deploy and can send a value
   * this bundle does not know.
   */
  platform?: string | null;
  /** The platforms this game is priced on, and whether it overrides the account. */
  platforms?: string[];
  platformsAreOwn?: boolean;
};

export type FavouriteList = {
  items: FavouriteItem[];
  /** How many are being watched, against the cap. */
  tracked: number;
  limit: number;
};

export type FavouriteAdded = {
  item: FavouriteItem;
  tracked: number;
  limit: number;
};

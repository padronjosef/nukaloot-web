export type TypeFilter = "all" | "game" | "dlc" | "bundle";

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
  imageUrl: string;
  backgroundUrl: string;
  releaseDate: string;
  storeName?: string;
  store?: { name: string; url: string };
}

export type SearchResponse = {
  game: { name: string; slug: string };
  prices: PriceResult[];
}

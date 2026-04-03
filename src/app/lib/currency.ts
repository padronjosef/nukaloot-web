const CURRENCIES = [
  { code: "USD", name: "United States Dollar", symbol: "$", country: "us" },
  { code: "EUR", name: "Euro", symbol: "€", country: "eu" },
  { code: "COP", name: "Colombian Peso", symbol: "$", country: "co" },
  { code: "GBP", name: "British Pound Sterling", symbol: "£", country: "gb" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", country: "br" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", country: "mx" },
  { code: "ARS", name: "Argentine Peso", symbol: "$", country: "ar" },
  { code: "CLP", name: "Chilean Peso", symbol: "$", country: "cl" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/", country: "pe" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", country: "jp" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", country: "ca" },
  { code: "AUD", name: "Australian Dollar", symbol: "$", country: "au" },
] as const;

export { CURRENCIES };

export const getCurrencySymbol = (code: string): string => {
  return CURRENCIES.find((c) => c.code === code)?.symbol || "$";
};

export const getCountryForCurrency = (code: string): string => {
  return CURRENCIES.find((c) => c.code === code)?.country || "us";
};

const STORAGE_KEY = "exchange_rates";
const CACHE_HOURS = 6;

type CachedRates = {
  rates: Record<string, number>;
  timestamp: number;
}

const getCachedRates = (): Record<string, number> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cached: CachedRates = JSON.parse(raw);
    const ageMs = Date.now() - cached.timestamp;
    if (ageMs > CACHE_HOURS * 60 * 60 * 1000) return null;
    return cached.rates;
  } catch {
    return null;
  }
};

export const getExchangeRates = async (): Promise<Record<string, number>> => {
  const cached = getCachedRates();
  if (cached) return cached;

  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  const data = await res.json();

  const rates: Record<string, number> = data.rates;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ rates, timestamp: Date.now() }),
  );

  return rates;
};

export const convertPrice = (
  amount: number,
  rates: Record<string, number>,
  to: string,
  from = "USD",
): number => {
  // Convert to USD first, then to target currency
  const fromRate = rates[from] ?? 1;
  const usdAmount = amount / fromRate;
  if (to === "USD") return Math.round(usdAmount * 100) / 100;
  const toRate = rates[to] ?? 1;
  return Math.round(usdAmount * toRate * 100) / 100;
};

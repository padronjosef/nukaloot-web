"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CurrencySelector,
  getCurrencySymbol,
  getCountryForCurrency,
  detectUserCurrency,
  type CurrencyCode,
} from "./components/CurrencySelector";
import { getExchangeRates, convertPrice } from "./lib/currency";
import { FeaturedCarousel } from "./components/FeaturedCarousel";
import { UpcomingGames } from "./components/UpcomingGames";
import { BackgroundImage } from "./components/BackgroundImage";
import { Toast, ToastContainer } from "./components/Toast";
import { GameCard, SkeletonCard } from "./components/GameCard";

const API_URL = "/api";

type TypeFilter = "all" | "game" | "dlc" | "bundle";
type ViewMode = "grid" | "list";

interface PriceResult {
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

interface SearchResponse {
  game: { name: string; slug: string };
  prices: PriceResult[];
}

function getStoredCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "USD";
  return (localStorage.getItem("currency") as CurrencyCode) || "USD";
}

function getStoredViewMode(): ViewMode {
  if (typeof window === "undefined") return "grid";
  return (localStorage.getItem("view_mode") as ViewMode) || "grid";
}

function getStoredStores(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const saved = localStorage.getItem("selected_stores");
  if (!saved) return new Set();
  const arr = JSON.parse(saved);
  return new Set(arr);
}

function getStoredCheapestOnly(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cheapest_only") === "true";
}

const HOME_BACKGROUNDS = [
  "/home-backgrounds/home-background-1.jpg",
  "/home-backgrounds/home-background-2.jpg",
  "/home-backgrounds/home-background-3.png",
  "/home-backgrounds/home-background-4.jpg",
  "/home-backgrounds/home-background-5.jpg",
];

function getHomeBackground(): string {
  if (typeof window === "undefined") return HOME_BACKGROUNDS[0];
  const stored = sessionStorage.getItem("home_background");
  if (stored) return stored;
  const picked = HOME_BACKGROUNDS[Math.floor(Math.random() * HOME_BACKGROUNDS.length)];
  sessionStorage.setItem("home_background", picked);
  return picked;
}

const TYPE_LABELS: Record<TypeFilter, string> = {
  all: "All",
  game: "Base Game",
  dlc: "DLC",
  bundle: "Bundle",
};

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="11" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="1" y1="3" x2="17" y2="3" />
      <line x1="1" y1="9" x2="17" y2="9" />
      <line x1="1" y1="15" x2="17" y2="15" />
    </svg>
  );
}

function PriceCardList({
  price,
  index,
  displayPrice,
}: {
  price: PriceResult;
  index: number;
  displayPrice: (usd: number) => string;
}) {
  return (
    <a
      href={price.productUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/80 border border-zinc-700/50 hover:border-zinc-600 transition-colors backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <span className="w-6 flex items-center justify-center">
          <StoreIcon storeName={price.store?.name || price.storeName || ""} />
        </span>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {price.gameType === "dlc" && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-orange-900/50 text-orange-300">
                DLC
              </span>
            )}
            {price.gameType === "bundle" && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300">
                Bundle
              </span>
            )}
            <span className="font-medium">{price.gameName}</span>
          </div>
          <span className="text-xs text-zinc-500">{price.store?.name || price.storeName}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {price.originalPrice && price.originalPrice > price.price && (
          <span className="text-sm text-zinc-500 line-through">
            {displayPrice(Number(price.originalPrice))}
          </span>
        )}
        <span
          className={`text-lg font-bold ${
            index === 0 ? "text-green-400" : "text-zinc-100"
          }`}
        >
          {displayPrice(Number(price.price))}
        </span>
      </div>
    </a>
  );
}

const STORE_ICONS: Record<string, { file: string; ext: "png" | "svg" }> = {
  "Steam": { file: "steam", ext: "png" },
  "GOG": { file: "gog", ext: "png" },
  "Epic Games Store": { file: "epicgames", ext: "svg" },
  "Humble Store": { file: "humble", ext: "png" },
  "Fanatical": { file: "fanatical", ext: "png" },
  "GreenManGaming": { file: "greenmangaming", ext: "svg" },
  "Origin": { file: "origin", ext: "svg" },
  "Uplay": { file: "ubisoft", ext: "svg" },
  "GamersGate": { file: "gamersgate", ext: "png" },
  "IndieGala": { file: "indiegala", ext: "png" },
  "Blizzard Shop": { file: "blizzard", ext: "png" },
  "2Game": { file: "2game", ext: "svg" },
  "GameBillet": { file: "gamebillet", ext: "png" },
  "Games Planet": { file: "gamesplanet", ext: "png" },
  "WinGameStore": { file: "wingamestore", ext: "png" },
  "Gamesload": { file: "gamesload", ext: "svg" },
  "DLGamer": { file: "dlgamer", ext: "png" },
  "Noctre": { file: "noctre", ext: "png" },
  "DreamGame": { file: "dreamgame", ext: "svg" },
  "Instant Gaming": { file: "instantgaming", ext: "png" },
};

const MAIN_STORES = new Set([
  "Blizzard Shop",
  "Epic Games Store",
  "GOG",
  "Humble Store",
  "Instant Gaming",
  "Origin",
  "Steam",
  "Uplay",
]);

function StoreIcon({ storeName }: { storeName: string }) {
  const icon = STORE_ICONS[storeName];
  if (!icon) return null;
  return (
    <img
      src={`/store-icons/${icon.file}.${icon.ext}`}
      alt={storeName}
      title={storeName}
      width={24}
      height={24}
      className="inline-block rounded-sm"
      style={{ width: 24, height: 24 }}
    />
  );
}

function PriceCardGrid({
  price,
  index,
  displayPrice,
}: {
  price: PriceResult;
  index: number;
  displayPrice: (usd: number) => string;
}) {
  const badges = [];
  if (price.gameType === "dlc") badges.push({ label: "DLC", className: "bg-orange-500" });
  if (price.gameType === "bundle") badges.push({ label: "Bundle", className: "bg-purple-500" });

  return (
    <GameCard
      href={price.productUrl}
      image={price.imageUrl}
      name={price.gameName}
      badges={badges}
      storeIcon={<StoreIcon storeName={price.store?.name || price.storeName || ""} />}
      bottomRight={
        <div className="flex flex-col items-end bg-black/70 rounded px-2 py-1">
          {price.originalPrice && price.originalPrice > price.price && (
            <span className="text-xs text-zinc-200 line-through">
              {displayPrice(Number(price.originalPrice))}
            </span>
          )}
          <span
            className={`text-lg font-bold ${
              index === 0 ? "text-green-400" : "text-white"
            }`}
          >
            {displayPrice(Number(price.price))}
          </span>
        </div>
      }
    />
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [viewMode, setViewModeState] = useState<ViewMode>("grid");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [homeBg, setHomeBg] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [pendingScrapers, setPendingScrapers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const ITEMS_PER_PAGE = 21;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showRecent, setShowRecent] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [selectedStores, setSelectedStoresState] = useState<Set<string>>(new Set());
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [cheapestOnly, setCheapestOnlyState] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const storeDropdownRef = useRef<HTMLDivElement>(null);

  function setViewMode(mode: ViewMode) {
    setViewModeState(mode);
    localStorage.setItem("view_mode", mode);
  }

  function setSelectedStores(updater: Set<string> | ((prev: Set<string>) => Set<string>)) {
    setSelectedStoresState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem("selected_stores", JSON.stringify([...next]));
      return next;
    });
  }

  function setCheapestOnly(value: boolean) {
    setCheapestOnlyState(value);
    localStorage.setItem("cheapest_only", String(value));
  }

  useEffect(() => {
    const storedCurrency = getStoredCurrency();
    setCurrency(storedCurrency);
    // Auto-detect currency if user never chose one
    if (!localStorage.getItem("currency")) {
      detectUserCurrency().then((detected) => {
        if (detected) {
          setCurrency(detected);
          localStorage.setItem("currency", detected);
        }
      });
    }
    setHomeBg(getHomeBackground());
    setViewModeState(getStoredViewMode());
    setSelectedStoresState(getStoredStores());
    setCheapestOnlyState(getStoredCheapestOnly());
    getExchangeRates()
      .then(setRates)
      .catch((err) => console.error("Failed to load rates:", err));

    const saved = localStorage.getItem("recent_searches");
    if (saved) setRecentSearches(JSON.parse(saved));

    // Search from URL query param
    const urlQ = new URLSearchParams(window.location.search).get("q");
    if (urlQ && urlQ.trim().length >= 2) {
      setQuery(urlQ.trim());
      doSearch(urlQ.trim());
    }

    const ro = new ResizeObserver(([entry]) => {
      setHeaderHeight(entry.contentRect.height);
    });
    if (headerRef.current) ro.observe(headerRef.current);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!showStoreDropdown) return;
    function handleClickOutside(e: MouseEvent) {
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(e.target as Node)) {
        setShowStoreDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStoreDropdown]);

  function handleCurrencyChange(code: CurrencyCode) {
    setCurrency(code);
    localStorage.setItem("currency", code);
  }

  function doSearch(rawTerm: string) {
    const term = rawTerm.replace(/\s+/g, ' ').trim();
    if (term.length < 2) return;

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("q", term);
    window.history.pushState({}, "", url.toString());

    setResults(null);
    setGameFilter("all");
    setVisibleCount(ITEMS_PER_PAGE);
    setShowRecent(false);
    setLoading(true);
    setScraping(false);
    setPendingScrapers([]);
    setError("");

    // Save to recent searches
    const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));

    // Load exchange rates
    getExchangeRates().then(setRates).catch(() => {});

    // SSE stream
    const evtSource = new EventSource(
      `${API_URL}/search/stream?q=${encodeURIComponent(term)}&cc=${getCountryForCurrency(currency)}`
    );

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "pending") {
        setPendingScrapers(data.scrapers);
        setScraping(true);
      }

      if (data.type === "fast") {
        setResults({ game: data.game, prices: data.prices });
        setLastUpdated(new Date());
        setLoading(false);
      }

      if (data.type === "slow") {
        setResults((prev) => {
          if (!prev) return prev;
          // Merge new prices, sort by price
          const all = [...prev.prices, ...data.prices];
          all.sort((a: PriceResult, b: PriceResult) => Number(a.price) - Number(b.price));
          return { ...prev, prices: all };
        });
        // Remove completed scraper from pending
        setPendingScrapers((prev) => prev.slice(1));
      }

      if (data.type === "done") {
        setScraping(false);
        setPendingScrapers([]);
        evtSource.close();
      }
    };

    evtSource.onerror = () => {
      if (!results) {
        setError("Could not fetch prices. Make sure the API is running.");
        setLoading(false);
      }
      setScraping(false);
      evtSource.close();
    };
  }


  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query.trim());
  }

  const symbol = getCurrencySymbol(currency);

  function displayPrice(usdPrice: number): string {
    const converted = convertPrice(usdPrice, rates, currency);
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // All known stores (always shown in dropdown)
  const allStoreNames = Object.keys(STORE_ICONS).sort();

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [results, typeFilter, gameFilter]);

  // Stores that have results for the current search
  const storesWithResults = new Set(
    results ? results.prices.map((p) => p.store?.name || p.storeName || "").filter(Boolean) : []
  );

  const allStoresSelected = selectedStores.size === 0 || selectedStores.size === allStoreNames.length;

  function toggleStore(store: string) {
    setSelectedStores((prev) => {
      // If currently "all" (empty set), expand to all stores then remove the clicked one
      if (prev.size === 0) {
        const next = new Set(allStoreNames);
        next.delete(store);
        return next;
      }
      // If currently "none" (__none__ sentinel), start fresh with just this store
      if (prev.has("__none__")) {
        return new Set([store]);
      }
      const next = new Set(prev);
      if (next.has(store)) next.delete(store);
      else next.add(store);
      // If all are selected again, reset to empty (meaning "all")
      if (next.size === allStoreNames.length) return new Set();
      // If none left, use sentinel
      if (next.size === 0) return new Set(["__none__"]);
      return next;
    });
  }

  function toggleAllStores() {
    if (allStoresSelected) {
      setSelectedStores(new Set(["__none__"]));
    } else {
      setSelectedStores(new Set());
    }
  }

  function toggleGroup(groupStores: string[]) {
    setSelectedStores((prev) => {
      const current = prev.size === 0 ? new Set(allStoreNames) : prev.has("__none__") ? new Set<string>() : new Set(prev);
      const allInGroup = groupStores.every((s) => current.has(s));
      if (allInGroup) {
        groupStores.forEach((s) => current.delete(s));
      } else {
        groupStores.forEach((s) => current.add(s));
      }
      if (current.size === allStoreNames.length) return new Set();
      if (current.size === 0) return new Set(["__none__"]);
      return current;
    });
  }

  // Extract unique base games, sorted by release date (newest first)
  const gameNames: string[] = results
    ? results.prices
        .filter((p) => p.gameType === "game")
        .reduce((acc, p) => {
          if (!acc.find((g) => g.name === p.gameName)) {
            acc.push({ name: p.gameName, date: p.releaseDate });
          }
          return acc;
        }, [] as { name: string; date: string }[])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((g) => g.name)
    : [];

  // Hero background: use the high-res background_raw from Steam
  const heroImage = results?.prices.find(
    (p) => p.backgroundUrl && (gameFilter === "all" ? p.gameType === "game" : p.gameName === gameFilter)
  )?.backgroundUrl;

  const filteredPrices = results?.prices.filter((p) => {
    const matchesType = typeFilter === "all" || p.gameType === typeFilter;
    const storeName = p.store?.name || p.storeName || "";
    const matchesStore = allStoresSelected || selectedStores.has(storeName);
    if (gameFilter === "all") return matchesType && matchesStore;
    return matchesType && matchesStore && p.gameName === gameFilter;
  });

  // Keep only the cheapest per game+type combo
  const displayPrices = cheapestOnly && filteredPrices
    ? filteredPrices.reduce((acc, p) => {
        const key = `${p.gameName}::${p.gameType}`;
        if (!acc.has(key) || Number(p.price) < Number(acc.get(key)!.price)) {
          acc.set(key, p);
        }
        return acc;
      }, new Map<string, PriceResult>())
      .values()
      .toArray() as PriceResult[]
    : filteredPrices;

  const SECTION_ORDER: { type: string; label: string }[] = [
    { type: "bundle", label: "Bundles" },
    { type: "game", label: "Base Games" },
    { type: "unknown", label: "Other" },
    { type: "dlc", label: "DLCs" },
  ];

  function groupByType(prices: PriceResult[]) {
    return SECTION_ORDER
      .map(({ type, label }) => ({
        label,
        type,
        items: prices.filter((p) => p.gameType === type),
      }))
      .filter((g) => g.items.length > 0);
  }

  function renderPrices(prices: PriceResult[]) {
    if (viewMode === "list") {
      return (
        <div className="space-y-3">
          {prices.map((price, i) => (
            <PriceCardList key={price.id || `${price.store?.name}-${price.gameName}-${price.price}`} price={price} index={i} displayPrice={displayPrice} />
          ))}
        </div>
      );
    }
    return (
      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {prices.map((price, i) => (
          <PriceCardGrid key={price.id || `${price.store?.name}-${price.gameName}-${price.price}`} price={price} index={i} displayPrice={displayPrice} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Fixed background - carousel or search hero */}
      <div
        className="fixed left-0 right-0 bottom-0 z-0 bg-zinc-950"
        style={{ top: headerHeight }}
      >
        <BackgroundImage image={heroImage || homeBg} opacity={0.8} />
      </div>


      {/* Sticky header */}
      <div
        ref={headerRef}
        className="sticky top-0 z-20 px-4 pt-4 pb-6 flex flex-col items-center bg-zinc-950"
      >
        <BackgroundImage image={heroImage || homeBg} opacity={0.8} />

        <header className="w-full max-w-5xl text-center mb-4 relative flex flex-col items-center bg-black/70 rounded-lg px-5 py-3">
          <div className="absolute top-2 right-2 flex gap-0.5 bg-zinc-800 rounded p-0.5 z-10">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors cursor-pointer ${
                viewMode === "list" ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ListIcon />
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-1">Game Price Finder</h1>
          <p className="text-zinc-200 text-sm">
            Find the cheapest price across multiple stores
          </p>
        </header>

        <div className="flex gap-2 w-full max-w-5xl mb-3 relative items-center">
          {(Object.keys(TYPE_LABELS) as TypeFilter[]).map((type) => (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); setVisibleCount(ITEMS_PER_PAGE); }}
              className={`px-3 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                typeFilter === type
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCheapestOnly(!cheapestOnly)}
            className={`ml-auto px-3 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              cheapestOnly
                ? "bg-green-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Cheapest only
          </button>

          <div className="relative" ref={storeDropdownRef}>
            <button
              type="button"
              onClick={() => setShowStoreDropdown((v) => !v)}
              className={`flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                allStoresSelected
                  ? "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  : "bg-blue-600 text-white"
              }`}
            >
              Stores
              {!allStoresSelected && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedStores.has("__none__") ? 0 : selectedStores.size}
                </span>
              )}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={showStoreDropdown ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"} />
              </svg>
            </button>
            {showStoreDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-[100] py-1">
                <button
                  type="button"
                  onClick={toggleAllStores}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-700 cursor-pointer"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                    allStoresSelected ? "bg-blue-600 border-blue-600" : "border-zinc-500"
                  }`}>
                    {allStoresSelected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                        <path d="M2 5L4 7L8 3" />
                      </svg>
                    )}
                  </span>
                  <span className="text-zinc-200 font-medium">All stores</span>
                </button>
                <div className="h-px bg-zinc-700 mx-2 my-1" />
                <div className="flex">
                  {[
                    { label: "Main stores", stores: allStoreNames.filter((s) => MAIN_STORES.has(s)) },
                    { label: "Other stores", stores: allStoreNames.filter((s) => !MAIN_STORES.has(s)) },
                  ].map((group, gi) => (
                    <div key={group.label} className={`min-w-[200px] ${gi > 0 ? "border-l border-zinc-700" : ""}`}>
                      {(() => {
                        const currentSet = selectedStores.size === 0 ? new Set(allStoreNames) : selectedStores.has("__none__") ? new Set<string>() : selectedStores;
                        const allGroupSelected = group.stores.every((s) => currentSet.has(s));
                        return (
                          <div
                            className="flex items-center gap-2 px-3 pt-1 pb-1 cursor-pointer hover:bg-zinc-700"
                            onClick={() => toggleGroup(group.stores)}
                          >
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                              allGroupSelected ? "bg-blue-600 border-blue-600" : "border-zinc-500"
                            }`}>
                              {allGroupSelected && (
                                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                                  <path d="M2 5L4 7L8 3" />
                                </svg>
                              )}
                            </span>
                            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{group.label}</span>
                          </div>
                        );
                      })()}
                      {group.stores.map((store) => {
                        const hasResults = storesWithResults.has(store);
                        const unavailable = results && !hasResults;
                        const isSelected = allStoresSelected || (selectedStores.has(store) && !selectedStores.has("__none__"));
                        return (
                          <div
                            key={store}
                            title={unavailable ? "Not available for this game" : undefined}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-zinc-700 cursor-pointer ${
                              unavailable ? "brightness-50" : ""
                            }`}
                            onClick={() => toggleStore(store)}
                          >
                            <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected ? "bg-blue-600 border-blue-600" : "border-zinc-500"
                            }`}>
                              {isSelected && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                                  <path d="M2 5L4 7L8 3" />
                                </svg>
                              )}
                            </span>
                            <StoreIcon storeName={store} />
                            <span className={unavailable ? "text-zinc-500" : "text-zinc-300"}>{store}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-5xl mb-3 relative">
          <div className="flex gap-2 items-stretch">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => recentSearches.length > 0 && setShowRecent(true)}
                onBlur={() => setTimeout(() => setShowRecent(false), 200)}
                placeholder="Search for a game... (e.g. Elden Ring)"
                className="w-full h-12 px-4 pr-10 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults(null);
                    setError("");
                    setLastUpdated(null);
                    const url = new URL(window.location.href);
                    url.searchParams.delete("q");
                    window.history.pushState({}, "", url.toString());
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4L14 14M14 4L4 14" />
                  </svg>
                </button>
              )}
              {showRecent && recentSearches.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-[100] py-1"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <p className="px-3 py-1 text-xs text-zinc-500">Recent searches</p>
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        setShowRecent(false);
                        inputRef.current?.blur();
                        doSearch(term);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <CurrencySelector value={currency} onChange={handleCurrencyChange} availableRates={rates} />
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className="h-12 min-w-[160px] px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:brightness-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {gameNames.length > 1 && (
          <div className="flex flex-wrap gap-2 w-full max-w-5xl relative">
            <button
              onClick={() => { setGameFilter("all"); setVisibleCount(ITEMS_PER_PAGE); }}
              className={`px-3 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                gameFilter === "all"
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All Games
            </button>
            {gameNames.map((name) => (
              <button
                key={name}
                onClick={() => { setGameFilter(name); setVisibleCount(ITEMS_PER_PAGE); }}
                className={`px-3 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  gameFilter === name
                    ? "bg-zinc-100 text-zinc-900"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Featured carousel & upcoming - visible until results appear */}
      {!results && !loading && (
        <>
          <div className="w-full relative z-10">
            <FeaturedCarousel onSelect={(name) => { setQuery(name); doSearch(name); }} onRateLimited={() => setRateLimited(true)} />
          </div>
          <UpcomingGames onRateLimited={() => setRateLimited(true)} />
        </>
      )}

      {/* Results */}
      <div className="flex-1 px-4 pb-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-[5px] border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
              <p className="mt-6 text-zinc-400 text-lg">Searching for the best prices...</p>
            </div>
          )}


          {!loading && results && (
            <>
              {!displayPrices || displayPrices.length === 0 ? (
                <p className="text-zinc-400">
                  {typeFilter === "all"
                    ? "No prices found for this game."
                    : `No ${TYPE_LABELS[typeFilter].toLowerCase()} prices found.`}
                </p>
              ) : typeFilter !== "all" ? (
                renderPrices(displayPrices.slice(0, visibleCount))
              ) : (
                <div className="space-y-6">
                  {(() => {
                    let rendered = 0;
                    return groupByType(displayPrices).map((group) => {
                      if (rendered >= visibleCount) return null;
                      const remaining = visibleCount - rendered;
                      const items = group.items.slice(0, remaining);
                      rendered += items.length;
                      return (
                        <div key={group.type}>
                          <h3 className="text-base font-semibold text-white uppercase tracking-wider mb-2">
                            <span className="bg-black/70 px-2 py-1 rounded">{group.label}</span>
                          </h3>
                          {renderPrices(items)}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
              {displayPrices.length > visibleCount && (
                <div ref={sentinelRef} className="flex items-center justify-center py-8 gap-3">
                  <div className="w-5 h-5 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-sm text-zinc-500">Loading more...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!loading && displayPrices && displayPrices.length > 0 && (
        <div className="fixed bottom-6 left-6 z-50 bg-zinc-800 border border-zinc-700/50 rounded-lg px-4 py-2 shadow-2xl">
          <span className="text-sm text-zinc-300">
            <span className="font-bold text-white">{displayPrices.length}</span> results found
          </span>
        </div>
      )}

      <ToastContainer position="bottom-right">
        {error && (
          <Toast variant="error" message={error} onClose={() => setError("")} />
        )}
        {scraping && <Toast variant="info" message="Scraping more stores..." />}
        {rateLimited && (
          <Toast variant="warning" message="Steam rate limit reached. Some data may be unavailable." onClose={() => setRateLimited(false)} />
        )}
        {!loading && !scraping && lastUpdated && results && (
          <Toast
            variant="success"
            message={`Prices updated ${lastUpdated.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at ${lastUpdated.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`}
          />
        )}
      </ToastContainer>
    </div>
  );
}

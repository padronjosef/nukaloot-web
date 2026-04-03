"use client";

import { useState, useEffect, useRef } from "react";
import {
  CurrencySelector,
  getCurrencySymbol,
  getCountryForCurrency,
  type CurrencyCode,
} from "./components/CurrencySelector";
import { getExchangeRates, convertPrice } from "./lib/currency";
import { FeaturedCarousel } from "./components/FeaturedCarousel";
import { UpcomingGames } from "./components/UpcomingGames";
import { BackgroundImage } from "./components/BackgroundImage";
import { useCrossfade } from "./hooks/useCrossfade";
import { Toast, ToastContainer } from "./components/Toast";
import { GameCard, SkeletonCard } from "./components/GameCard";
import { Collapse } from "./components/Collapse";
import { Skeleton } from "./components/Skeleton";
import { ViewToggle } from "./components/ViewToggle";
import Image from "next/image";

const API_URL = "/api";

type TypeFilter = "all" | "game" | "dlc" | "bundle";
type ViewMode = "grid" | "list";

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
  if (typeof window === "undefined") return new Set(MAIN_STORES);
  const saved = localStorage.getItem("selected_stores");
  if (!saved) return new Set(MAIN_STORES);
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

function StoreIcon({ storeName }: { storeName: string }) {
  const icon = STORE_ICONS[storeName];
  if (!icon) return null;
  return (
    <Image
      src={`/store-icons/${icon.file}.${icon.ext}`}
      alt={storeName}
      title={storeName}
      width={24}
      height={24}
      className="inline-block rounded-sm"
    />
  );
}

function PriceCard({
  price,
  index,
  displayPrice,
  variant = "grid",
}: {
  price: PriceResult;
  index: number;
  displayPrice: (amount: number, from?: string) => string;
  variant?: "grid" | "list";
}) {
  const badges = [];
  if (price.gameType === "dlc") badges.push({ label: "DLC", className: "bg-orange-500" });
  if (price.gameType === "bundle") badges.push({ label: "Bundle", className: "bg-purple-500" });
  const priceCurrency = price.currency || "USD";

  return (
    <GameCard
      href={price.productUrl}
      image={price.imageUrl}
      name={price.gameName}
      badges={badges}
      variant={variant}
      storeIcon={<StoreIcon storeName={price.store?.name || price.storeName || ""} />}
      bottomRight={
        <div className={`flex flex-col items-end ${variant === "grid" ? "bg-black/70 rounded px-2 py-1" : ""}`}>
          {price.originalPrice && price.originalPrice > price.price && (
            <span className="text-xs text-zinc-200 line-through">
              {displayPrice(Number(price.originalPrice), priceCurrency)}
            </span>
          )}
          <span
            className={`font-bold ${variant === "list" ? "text-base" : "text-lg"} ${
              index === 0 ? "text-green-400" : "text-white"
            }`}
          >
            {displayPrice(Number(price.price), priceCurrency)}
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
  const [viewChangeCount, setViewChangeCount] = useState(0);
  const [filterFade, setFilterFade] = useState(false);
  const filterFadeRef = useRef<ReturnType<typeof setTimeout>>();
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [homeBg, setHomeBg] = useState<string | null>(HOME_BACKGROUNDS[0]);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [initializing, setInitializing] = useState(true);
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
  const [showMobileSummary, setShowMobileSummary] = useState({ dismissed: false, hiding: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [gameNamesExpanded, setGameNamesExpanded] = useState(false);
  const { layers: bgLayers, setImage: setBgImage } = useCrossfade();
  const gameNamesRef = useRef<HTMLDivElement>(null);
  const [gameNamesOverflows, setGameNamesOverflows] = useState(false);
  const [cheapestOnly, setCheapestOnlyState] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const storeDropdownRef = useRef<HTMLDivElement>(null);
  const storeDropdownMobileRef = useRef<HTMLDivElement>(null);

  function setViewMode(mode: ViewMode) {
    setViewModeState(mode);
    setViewChangeCount((c) => c + 1);
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
    setShowMobileSummary({ dismissed: false, hiding: false });
    setGameNamesExpanded(false);

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
        if (data.prices && data.prices.length > 0) {
          const existing: string[] = JSON.parse(localStorage.getItem("recent_searches") || "[]");
          const updated = [term, ...existing.filter((s: string) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
          setRecentSearches(updated);
          localStorage.setItem("recent_searches", JSON.stringify(updated));
        }
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

  // Hydrate state from localStorage after mount
  useEffect(() => {
    requestAnimationFrame(() => {
      setCurrency(getStoredCurrency());
      setViewModeState(getStoredViewMode());
      setHomeBg(getHomeBackground());
      setSelectedStoresState(getStoredStores());
      setCheapestOnlyState(getStoredCheapestOnly());
      const saved = localStorage.getItem("recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved));
    });

    getExchangeRates()
      .then(setRates)
      .catch((err) => console.error("Failed to load rates:", err));

    // Search from URL query param
    const urlQ = new URLSearchParams(window.location.search).get("q");
    if (urlQ && urlQ.trim().length >= 2) {
      queueMicrotask(() => {
        setQuery(urlQ.trim());
        setLoading(true);
        setInitializing(false);
        doSearch(urlQ.trim());
      });
    } else {
      queueMicrotask(() => setInitializing(false));
    }

    const ro = new ResizeObserver(([entry]) => {
      setHeaderHeight(entry.contentRect.height);
    });
    if (headerRef.current) ro.observe(headerRef.current);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!showStoreDropdown) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const inDesktop = storeDropdownRef.current?.contains(target);
      const inMobile = storeDropdownMobileRef.current?.contains(target);
      if (!inDesktop && !inMobile) {
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    inputRef.current?.blur();
    doSearch(query.trim());
  }

  function removeRecentSearch(term: string) {
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  }

  const symbol = getCurrencySymbol(currency);

  function displayPrice(amount: number, from = "USD"): string {
    const converted = convertPrice(amount, rates, currency, from);
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

  useEffect(() => {
    if (!gameNamesRef.current) return;
    setGameNamesOverflows(gameNamesRef.current.scrollHeight > 40);
  }, [gameNames]);

  useEffect(() => {
    setFilterFade(true);
    clearTimeout(filterFadeRef.current);
    filterFadeRef.current = setTimeout(() => setFilterFade(false), 200);
  }, [selectedStores, cheapestOnly, typeFilter, gameFilter]);

  // Hero background: use the high-res background_raw from Steam
  const heroImage = results?.prices.find(
    (p) => p.backgroundUrl && (gameFilter === "all" ? p.gameType === "game" : p.gameName === gameFilter)
  )?.backgroundUrl;

  useEffect(() => {
    const img = heroImage || homeBg;
    if (img) setBgImage(img);
  }, [heroImage, homeBg, setBgImage]);

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
    return (
      <div key={viewChangeCount} className={`animate-fade-in-up transition-opacity duration-200 ${filterFade ? "opacity-0" : "opacity-100"} ${viewMode === "list" ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"}`}>
        {prices.map((price, i) => (
          <PriceCard key={price.id || `${price.store?.name}-${price.gameName}-${price.productUrl}`} price={price} index={i} displayPrice={displayPrice} variant={viewMode} />
        ))}
      </div>
    );
  }

  if (initializing) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950">
        <div className="px-4 pt-4 pb-6 flex flex-col items-center">
          {/* Skeleton header */}
          <div className="w-full max-w-5xl text-center mb-4 bg-zinc-800/50 rounded-lg px-5 py-3 flex flex-col items-center">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          {/* Skeleton filters */}
          <div className="flex gap-2 w-full max-w-5xl mb-4">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-14" />
            <Skeleton className="h-9 w-18" />
            <Skeleton className="ml-auto h-9 w-9" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
          {/* Skeleton search */}
          <Skeleton className="w-full max-w-5xl h-12" />
        </div>
        {/* Skeleton recent searches */}
        <div className="w-full max-w-5xl mx-auto px-4 mb-6">
          <Skeleton className="h-7 w-44 mb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        </div>
        {/* Skeleton carousel */}
        <div className="w-full max-w-5xl mx-auto px-4 mb-6">
          <Skeleton className="h-7 w-40 mb-3" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="shrink-0 w-[260px] md:w-[400px] aspect-video" />
            ))}
          </div>
        </div>
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
        <BackgroundImage crossfade={bgLayers} opacity={0.5} />
      </div>


      {/* Mobile menu backdrop */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/50 z-[499] transition-opacity duration-200 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sticky header */}
      <div
        ref={headerRef}
        className="sticky top-0 z-[500] pt-4 pb-4 flex justify-center bg-zinc-950"
      >
        <BackgroundImage crossfade={bgLayers} opacity={0.5} />
        <div className="w-full max-w-5xl px-4 flex flex-col items-center">

        {/* Desktop header */}
        <header className="hidden md:flex w-full text-center mb-4 relative flex-col items-center bg-black/70 rounded-lg px-5 py-3">
          <div className="absolute top-2 right-2 z-10">
            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
          <h1 className="text-3xl font-bold mb-1">Game Price Finder</h1>
          <p className="text-zinc-200 text-sm">
            Find the cheapest price across multiple stores
          </p>
        </header>

        {/* Mobile header bar */}
        <div className="md:hidden w-full mb-3 relative z-[400] flex items-center bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 cursor-pointer" onClick={() => setMobileMenuOpen((v) => !v)}>
          <div
            className={`w-[34px] h-[34px] flex items-center justify-center rounded-lg transition-colors ${
              mobileMenuOpen
                ? "text-white bg-zinc-600"
                : "text-zinc-300 bg-zinc-700"
            }`}
          >
            <div className="w-[18px] h-[14px] flex flex-col justify-between relative">
              <span className={`block h-[2px] w-full bg-current rounded-full transition-all duration-300 origin-center ${
                mobileMenuOpen ? "translate-y-[6px] rotate-45" : ""
              }`} />
              <span className={`block h-[2px] w-full bg-current rounded-full transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0 scale-x-0" : ""
              }`} />
              <span className={`block h-[2px] w-full bg-current rounded-full transition-all duration-300 origin-center ${
                mobileMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`} />
            </div>
          </div>
          <h1 className="text-lg font-bold text-white flex-1 text-center">Game Price Finder</h1>
          <div className="w-[34px] h-[34px]" />

          {/* Mobile burger menu panel — overlay */}
          <Collapse open={mobileMenuOpen} maxHeight="70vh" duration={200} className="absolute left-0 right-0 top-full mt-1 z-[400]">
            <div className="bg-zinc-800 border border-zinc-600/50 rounded-lg px-4 py-4 flex flex-col gap-4 shadow-2xl max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Cheapest only */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Cheapest only</span>
                <button
                  type="button"
                  onClick={() => setCheapestOnly(!cheapestOnly)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
                    cheapestOnly
                      ? "text-green-400 bg-green-900"
                      : "text-zinc-300 bg-zinc-700 hover:text-white hover:bg-zinc-600"
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </button>
              </div>

              {/* View mode */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wider">View</span>
                <ViewToggle value={viewMode} onChange={(m) => { setViewMode(m); setMobileMenuOpen(false); }} />
              </div>

              {/* Currency */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Currency</span>
                <CurrencySelector value={currency} onChange={(c) => { handleCurrencyChange(c); setMobileMenuOpen(false); }} availableRates={rates} />
              </div>

              <hr className="border-zinc-600" />

              {/* Stores */}
              <div ref={storeDropdownMobileRef}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Stores</span>
                  <button
                    type="button"
                    onClick={toggleAllStores}
                    className={`text-xs px-2 py-1 rounded border border-zinc-600/50 cursor-pointer ${
                      allStoresSelected ? "text-zinc-400 hover:text-zinc-200" : "text-blue-400 hover:text-blue-300"
                    }`}
                  >
                    {allStoresSelected ? "Deselect all" : "Select all"}
                  </button>
                </div>
                {[
                  { label: "Main stores", stores: allStoreNames.filter((s) => MAIN_STORES.has(s)) },
                  { label: "Other stores", stores: allStoreNames.filter((s) => !MAIN_STORES.has(s)) },
                ].map((group) => {
                  const currentSet = selectedStores.size === 0 ? new Set(allStoreNames) : selectedStores.has("__none__") ? new Set<string>() : selectedStores;
                  const allGroupSelected = group.stores.every((s) => currentSet.has(s));
                  return (
                    <div key={group.label} className="mb-5">
                      <div
                        className="flex items-center gap-2 py-1 mb-2 cursor-pointer"
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
                        <span className="text-sm font-bold text-white uppercase tracking-wider">{group.label}</span>
                      </div>
                      <div className="flex flex-col">
                        {group.stores.map((store) => {
                          const hasResults = storesWithResults.has(store);
                          const unavailable = results && !hasResults;
                          const isSelected = allStoresSelected || (selectedStores.has(store) && !selectedStores.has("__none__"));
                          return (
                            <div
                              key={store}
                              className={`flex items-center gap-3 px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-zinc-800 ${
                                unavailable ? "brightness-50" : ""
                              }`}
                              onClick={() => toggleStore(store)}
                            >
                              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-blue-600 border-blue-600" : "border-zinc-500"
                              }`}>
                                {isSelected && (
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M2 5L4 7L8 3" />
                                  </svg>
                                )}
                              </span>
                              <StoreIcon storeName={store} />
                              <span className={`truncate ${unavailable ? "text-zinc-500" : "text-white"}`}>{store}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Collapse>
        </div>

        {/* === Desktop layout (md+): original 2-row layout === */}
        <div className="hidden md:flex gap-2 w-full mb-4 relative items-center">
          {(Object.keys(TYPE_LABELS) as TypeFilter[]).map((type) => (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); setVisibleCount(ITEMS_PER_PAGE); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
            className={`ml-auto flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              cheapestOnly
                ? "text-green-400 bg-green-900"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Cheapest only
          </button>

          <CurrencySelector value={currency} onChange={handleCurrencyChange} availableRates={rates} />

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
              <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-[100] py-1 animate-fade-in-up">
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
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{group.label}</span>
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
                            <span className={unavailable ? "text-zinc-500" : "text-white"}>{store}</span>
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

        <form onSubmit={handleSearch} className="hidden md:block w-full mb-5 relative">
          <div className="flex items-stretch">
            <div className="relative flex-1 transition-all duration-300">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { setInputFocused(true); recentSearches.length > 0 && setShowRecent(true); }}
                onBlur={() => { setInputFocused(false); setTimeout(() => setShowRecent(false), 200); }}
                disabled={loading}
                placeholder={loading ? "Searching..." : "Search for a game... (e.g. Elden Ring)"}
                className={`w-full h-12 px-4 pr-14 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${loading ? "animate-pulse opacity-60" : ""}`}
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
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
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className={`h-12 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:brightness-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-all duration-300 overflow-hidden ${
                inputFocused && query.trim().length >= 2 && !loading ? "w-12 ml-2 opacity-100" : "w-0 ml-0 opacity-0"
              }`}
            >
              {loading ? (
                <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* === Mobile/Tablet layout (<md): 4 rows === */}
        {/* Row 1: Type filters */}
        <div className="flex md:hidden gap-2 w-full mb-3 relative">
          {(Object.keys(TYPE_LABELS) as TypeFilter[]).map((type) => (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); setVisibleCount(ITEMS_PER_PAGE); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className={`px-3 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                typeFilter === type
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Row 2: Search + Submit */}
        <form onSubmit={handleSearch} className="md:hidden w-full mb-4 relative">
          <div className="flex items-stretch">
            <div className="relative flex-1 min-w-0 transition-all duration-300">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { setInputFocused(true); recentSearches.length > 0 && setShowRecent(true); }}
                onBlur={() => { setInputFocused(false); setTimeout(() => setShowRecent(false), 200); }}
                disabled={loading}
                placeholder={loading ? "Searching..." : "Search for a game..."}
                className={`w-full h-11 px-4 pr-13 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${loading ? "animate-pulse opacity-60" : ""}`}
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
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
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className={`h-11 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:brightness-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-all duration-300 overflow-hidden ${
                inputFocused && query.trim().length >= 2 && !loading ? "w-11 ml-2 opacity-100" : "w-0 ml-0 opacity-0"
              }`}
            >
              {loading ? (
                <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Row 4: Game name filters (shared between desktop and mobile) */}
        {gameNames.length > 1 && (
          <>
          {/* Game names backdrop */}
          <div
            onClick={() => setGameNamesExpanded(false)}
            className={`md:hidden fixed inset-0 bg-black/40 z-[100] transition-opacity duration-200 ${
              gameNamesExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          />
          <div className="w-full relative">
            {/* Collapsed row — always visible */}
            <div className="overflow-hidden h-8">
              <div ref={gameNamesRef} className="flex flex-wrap gap-2 pr-10">
                <button
                  onClick={() => { setGameFilter("all"); setVisibleCount(ITEMS_PER_PAGE); setGameNamesExpanded(false); }}
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
                    onClick={() => { setGameFilter(name); setVisibleCount(ITEMS_PER_PAGE); setGameNamesExpanded(false); }}
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
            </div>
            {/* Expanded overlay — mobile: absolute, desktop: pushes content */}
            <Collapse open={gameNamesExpanded} className="md:relative absolute left-0 right-0 top-0 z-[101] bg-zinc-900 md:bg-transparent rounded-lg md:rounded-none shadow-2xl md:shadow-none">
              <div className="flex flex-wrap gap-2 p-2 md:p-0 md:pt-2 pr-10">
                <button
                  onClick={() => { setGameFilter("all"); setVisibleCount(ITEMS_PER_PAGE); setGameNamesExpanded(false); }}
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
                    onClick={() => { setGameFilter(name); setVisibleCount(ITEMS_PER_PAGE); setGameNamesExpanded(false); }}
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
            </Collapse>
            {gameNamesOverflows && (
              <button
                type="button"
                onClick={() => setGameNamesExpanded(!gameNamesExpanded)}
                className="absolute right-0 top-0 h-8 w-8 flex items-center justify-center bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors z-[102]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${gameNamesExpanded ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
          </div>
          </>
        )}
        </div>
      </div>

      {/* Recent searches + Featured carousel & upcoming - visible until results appear */}
      {!initializing && !results && !loading && (
        <div className="animate-fade-in-up">
          {recentSearches.length > 0 && (
            <div className="w-full max-w-5xl mx-auto px-4 mb-6 relative z-10">
              <h2 className="text-lg font-bold text-white mb-3">
                <span className="bg-black/70 px-2 py-1 rounded">Recent Searches</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="flex items-center bg-zinc-800 border border-zinc-700/50 rounded-lg overflow-hidden group hover:border-zinc-600 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => { setQuery(term); doSearch(term); }}
                      className="flex-1 text-left px-4 py-3 text-sm text-zinc-300 hover:text-white transition-colors cursor-pointer truncate"
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRecentSearch(term)}
                      className="px-3 py-3 text-zinc-600 hover:text-red-400 cursor-pointer transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3l8 8M11 3l-8 8" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="w-full relative z-10">
            <FeaturedCarousel onSelect={(name) => { setQuery(name); doSearch(name); }} onRateLimited={() => setRateLimited(true)} />
          </div>
          <UpcomingGames onRateLimited={() => setRateLimited(true)} viewMode={viewMode} viewKey={viewChangeCount} />
        </div>
      )}

      {/* Results */}
      <div className="flex-1 pb-4 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
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
                          <h3 className="text-base font-semibold text-white tracking-wider mb-2">
                            <span className="bg-black/70 px-2 py-1 rounded">{group.label}</span>
                          </h3>
                          {renderPrices(items)}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
              {displayPrices && displayPrices.length > visibleCount && (
                <div ref={sentinelRef} className="flex items-center justify-center py-8 gap-3 bg-zinc-900 rounded-lg mx-auto max-w-xs px-6 py-4">
                  <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-base text-zinc-300 font-medium">Loading more...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Status bar — anchored to max-w-5xl wrapper */}
      {!loading && displayPrices && displayPrices.length > 0 && !showMobileSummary.dismissed && (
        <div className={`fixed bottom-2 md:bottom-6 left-0 right-0 z-[200] flex justify-center pointer-events-none transition-all duration-300 ${
          showMobileSummary.hiding ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}>
          <div className="w-full max-w-5xl px-4 md:px-0 flex justify-end pointer-events-none">
            <div className={`pointer-events-auto flex items-center justify-between md:justify-start gap-2 bg-zinc-800 rounded-lg px-4 py-2.5 shadow-2xl text-sm text-zinc-300 transition-colors duration-300 w-full md:w-auto ${
              scraping ? "border-loading" : !scraping && lastUpdated ? "border border-green-700" : "border border-zinc-700"
            }`}>
              <span className="leading-7"><span className="font-bold text-white">{displayPrices.length}</span> Results</span>
              <div className="flex items-center gap-2 leading-7">
                {scraping && (
                  <>
                    <span className="hidden md:inline text-zinc-600">·</span>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-blue-400">Scraping More Stores...</span>
                  </>
                )}
                {!scraping && lastUpdated && results && (
                  <>
                    <span className="hidden md:inline text-zinc-600">·</span>
                    <span className="text-zinc-400">Updated {lastUpdated.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowMobileSummary({ dismissed: false, hiding: true });
                    setTimeout(() => setShowMobileSummary({ dismissed: true, hiding: true }), 300);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white cursor-pointer transition-colors ml-1"
                >
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l8 8M11 3l-8 8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right">
        {error && (
          <Toast variant="error" message={error} onClose={() => setError("")} />
        )}
        {rateLimited && (
          <Toast variant="warning" message="Steam rate limit reached. Some data may be unavailable." onClose={() => setRateLimited(false)} />
        )}
      </ToastContainer>
    </div>
  );
}

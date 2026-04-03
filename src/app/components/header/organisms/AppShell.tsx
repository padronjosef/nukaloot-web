"use client";

import { useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { HOME_BACKGROUNDS } from "../../../lib/stores";
import { HeaderSkeleton } from "../atoms/HeaderSkeleton";
import { useMounted } from "../../../hooks/useMounted";
import { getHomeBackground } from "../../../lib/storage";
import { BackgroundImage } from "../../shared/atoms/BackgroundImage";
import { useCrossfade } from "../../../hooks/useCrossfade";
import { Toast, ToastContainer } from "../../shared/molecules/Toast";
import { TypeFilterBar } from "../molecules/TypeFilterBar";
import { ResultsToast } from "../molecules/ResultsToast";
import { SearchForm } from "../molecules/SearchForm";
import { GameNameFilter } from "../molecules/GameNameFilter";
import { ViewToggle } from "../atoms/ViewToggle";
import { BurgerIcon } from "../atoms/BurgerIcon";
import { CheapestButton } from "../atoms/CheapestButton";
import { FireIcon } from "../../shared/atoms/FireIcon";
import { useFilterStore, selectAllStoresSelected } from "../../../stores/useFilterStore";
import { useSearchStore } from "../../../stores/useSearchStore";
import { useUIStore } from "../../../stores/useUIStore";
import type { TypeFilter } from "../../../lib/stores";

const CurrencySelector = dynamic(() =>
  import("../molecules/CurrencySelector").then((m) => ({ default: m.CurrencySelector })),
);
const MobileMenu = dynamic(
  () => import("./MobileMenu").then((m) => ({ default: m.MobileMenu })),
  { ssr: false },
);
const StoreDropdown = dynamic(() =>
  import("./StoreDropdown").then((m) => ({ default: m.StoreDropdown })),
);

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const mounted = useMounted();
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const homeBgRef = useRef<string>(HOME_BACKGROUNDS[0]);

  // Filter store
  const currency = useFilterStore((s) => s.currency);
  const typeFilter = useFilterStore((s) => s.typeFilter);
  const gameFilter = useFilterStore((s) => s.gameFilter);
  const viewMode = useFilterStore((s) => s.viewMode);
  const cheapestOnly = useFilterStore((s) => s.cheapestOnly);
  const selectedStores = useFilterStore((s) => s.selectedStores);
  const allStoresSelected = useFilterStore(selectAllStoresSelected);
  const setCurrency = useFilterStore((s) => s.setCurrency);
  const setTypeFilter = useFilterStore((s) => s.setTypeFilter);
  const setGameFilter = useFilterStore((s) => s.setGameFilter);
  const setViewMode = useFilterStore((s) => s.setViewMode);
  const setCheapestOnly = useFilterStore((s) => s.setCheapestOnly);
  const hydrate = useFilterStore((s) => s.hydrate);

  // Search store
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const results = useSearchStore((s) => s.results);
  const loading = useSearchStore((s) => s.loading);
  const scraping = useSearchStore((s) => s.scraping);
  const error = useSearchStore((s) => s.error);
  const setError = useSearchStore((s) => s.setError);
  const lastUpdated = useSearchStore((s) => s.lastUpdated);
  const recentSearches = useSearchStore((s) => s.recentSearches);
  const showRecent = useSearchStore((s) => s.showRecent);
  const setShowRecent = useSearchStore((s) => s.setShowRecent);
  const rates = useSearchStore((s) => s.rates);
  const doSearch = useSearchStore((s) => s.doSearch);
  const clearSearch = useSearchStore((s) => s.clearSearch);

  // UI store
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);
  const inputFocused = useUIStore((s) => s.inputFocused);
  const setInputFocused = useUIStore((s) => s.setInputFocused);
  const headerHeight = useUIStore((s) => s.headerHeight);
  const setHeaderHeight = useUIStore((s) => s.setHeaderHeight);
  const rateLimited = useUIStore((s) => s.rateLimited);
  const setRateLimited = useUIStore((s) => s.setRateLimited);
  const triggerFilterFade = useUIStore((s) => s.triggerFilterFade);

  // Background crossfade
  const { layers: bgLayers, setImage: setBgImage } = useCrossfade();

  // Derived
  const gameNames = useMemo(() => {
    if (!results) return [];
    const seen = new Map<string, string>();
    for (const p of results.prices) {
      if (p.gameType === "game" && !seen.has(p.gameName)) {
        seen.set(p.gameName, p.releaseDate);
      }
    }
    return [...seen.entries()]
      .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
      .map(([name]) => name);
  }, [results]);

  const heroImage = useMemo(
    () =>
      results?.prices.find(
        (p) =>
          p.backgroundUrl &&
          (gameFilter === "all"
            ? p.gameType === "game"
            : p.gameName === gameFilter),
      )?.backgroundUrl,
    [results, gameFilter],
  );

  const filteredPrices = useMemo(
    () =>
      results?.prices.filter((p) => {
        const matchesType = typeFilter === "all" || p.gameType === typeFilter;
        const storeName = p.store?.name || p.storeName || "";
        const matchesStore = allStoresSelected || selectedStores.has(storeName);
        if (gameFilter === "all") return matchesType && matchesStore;
        return matchesType && matchesStore && p.gameName === gameFilter;
      }),
    [results, typeFilter, allStoresSelected, selectedStores, gameFilter],
  );

  const displayPrices = useMemo(() => {
    if (!filteredPrices) return undefined;
    if (!cheapestOnly) return filteredPrices;
    return [
      ...filteredPrices
        .reduce((acc, p) => {
          const key = `${p.gameName}::${p.gameType}`;
          if (!acc.has(key) || Number(p.price) < Number(acc.get(key)!.price)) {
            acc.set(key, p);
          }
          return acc;
        }, new Map<string, (typeof filteredPrices)[number]>())
        .values(),
    ];
  }, [cheapestOnly, filteredPrices]);

  // Handlers
  const handleTypeChange = (type: TypeFilter) => {
    setTypeFilter(type);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const lastSearched = useSearchStore((s) => s.results?.game?.name || "");

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (term.length < 2) {
      inputRef.current?.blur();
      return;
    }
    inputRef.current?.blur();
    router.push(`/search?q=${encodeURIComponent(term)}`);
    doSearch(term);
  };

  const handleClear = () => {
    clearSearch();
    router.push("/");
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
    doSearch(term);
  };

  // Effects
  useEffect(() => {
    hydrate();
    useSearchStore.getState().initRates();
    const saved = localStorage.getItem("recent_searches");
    if (saved) useSearchStore.setState({ recentSearches: JSON.parse(saved) });
    homeBgRef.current = getHomeBackground();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) =>
      setHeaderHeight(entry.contentRect.height),
    );
    if (headerRef.current) ro.observe(headerRef.current);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const img = heroImage || homeBgRef.current;
    if (img) setBgImage(img);
  }, [heroImage, setBgImage]);

  useEffect(() => {
    triggerFilterFade();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStores, cheapestOnly, typeFilter, gameFilter, currency, viewMode]);

  if (!mounted) return <HeaderSkeleton>{children}</HeaderSkeleton>;

  return (
    <div className="flex flex-col min-h-screen relative">
      <div
        className="fixed left-0 right-0 bottom-0 z-0 bg-zinc-950"
        style={{ top: headerHeight }}
      >
        <BackgroundImage crossfade={bgLayers} opacity={0.5} />
      </div>

      {/* Mobile menu backdrop */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/50 z-499 transition-opacity duration-200 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sticky header */}
      <div
        ref={headerRef}
        className="sticky top-0 z-500 pt-4 pb-4 flex justify-center bg-zinc-950"
      >
        <BackgroundImage crossfade={bgLayers} opacity={0.5} />
        <div className="w-full max-w-5xl px-4 flex flex-col items-center">
          {/* Desktop header */}
          <header className="hidden md:flex w-full text-center mb-4 relative flex-col items-center bg-black/70 rounded-lg px-5 py-3">
            <div className="absolute top-2 right-2 z-10">
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
              <FireIcon size={24} />
              Game Price Finder
            </h1>
            <p className="text-zinc-200 text-sm">
              Find the cheapest price across multiple stores
            </p>
            <span className="absolute bottom-2 left-3 text-[10px] text-zinc-500">
              v{process.env.NEXT_PUBLIC_APP_VERSION}
            </span>
          </header>

          {/* Mobile header bar */}
          <div
            className="md:hidden w-full mb-3 relative z-400 flex items-center bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 cursor-pointer"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <BurgerIcon open={mobileMenuOpen} />
            <h1 className="text-lg font-bold text-white flex-1 text-center flex items-center justify-center gap-1.5">
              <FireIcon size={18} />
              Game Price Finder
            </h1>
            <div className="w-8.5 h-8.5" />
            <MobileMenu />
          </div>

          {/* Desktop filter row */}
          <div className="hidden md:flex gap-2 w-full mb-4 relative items-center">
            <TypeFilterBar value={typeFilter} onChange={handleTypeChange} />
            <CheapestButton
              active={cheapestOnly}
              onClick={() => setCheapestOnly(!cheapestOnly)}
              className="ml-auto"
            />
            <CurrencySelector
              value={currency}
              onChange={setCurrency}
              availableRates={rates}
            />
            <StoreDropdown />
          </div>

          {/* Desktop search */}
          <SearchForm
            query={query}
            onQueryChange={setQuery}
            onSubmit={onSubmitSearch}
            onClear={handleClear}
            onSelectRecent={handleSelectRecent}
            loading={loading}
            inputFocused={inputFocused}
            onFocusChange={setInputFocused}
            recentSearches={recentSearches}
            showRecent={showRecent}
            onShowRecentChange={setShowRecent}
            lastSearched={lastSearched}
            inputRef={inputRef}
            variant="desktop"
            className="hidden md:block w-full mb-5 relative"
          />

          {/* Mobile type filters */}
          <TypeFilterBar
            value={typeFilter}
            onChange={handleTypeChange}
            className="md:hidden w-full mb-3 relative"
          />

          {/* Mobile search */}
          <SearchForm
            query={query}
            onQueryChange={setQuery}
            onSubmit={onSubmitSearch}
            onClear={handleClear}
            onSelectRecent={handleSelectRecent}
            loading={loading}
            inputFocused={inputFocused}
            onFocusChange={setInputFocused}
            recentSearches={recentSearches}
            showRecent={showRecent}
            onShowRecentChange={setShowRecent}
            lastSearched={lastSearched}
            variant="mobile"
            className="md:hidden w-full mb-4 relative"
          />

          {/* Game name filters */}
          <GameNameFilter
            gameNames={gameNames}
            activeFilter={gameFilter}
            onFilterChange={setGameFilter}
          />
        </div>
      </div>

      {/* Page content */}
      {children}

      <ResultsToast
        resultCount={displayPrices?.length || 0}
        scraping={scraping}
        lastUpdated={lastUpdated}
        visible={!loading && !!displayPrices && displayPrices.length > 0}
      />

      <ToastContainer position="bottom-right">
        {error && (
          <Toast variant="error" message={error} onClose={() => setError("")} />
        )}
        {rateLimited && (
          <Toast
            variant="warning"
            message="Steam rate limit reached. Some data may be unavailable."
            onClose={() => setRateLimited(false)}
          />
        )}
      </ToastContainer>
    </div>
  );
};

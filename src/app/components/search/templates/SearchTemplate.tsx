"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getCurrencySymbol } from "../../../lib/currency";
import { convertPrice } from "../../../lib/currency";
import { PriceGrid } from "../organisms/PriceGrid";
import { useSearchStore } from "../../../stores/useSearchStore";
import { useFilterStore, selectAllStoresSelected } from "../../../stores/useFilterStore";
import { useUIStore } from "../../../stores/useUIStore";
import type { PriceResult } from "../../../lib/stores";

const ITEMS_PER_PAGE = 21;

export const SearchTemplate = () => {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const prevQueryRef = useRef("");

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Search store
  const results = useSearchStore((s) => s.results);
  const loading = useSearchStore((s) => s.loading);
  const doSearch = useSearchStore((s) => s.doSearch);
  const setQuery = useSearchStore((s) => s.setQuery);

  // Filter store
  const currency = useFilterStore((s) => s.currency);
  const typeFilter = useFilterStore((s) => s.typeFilter);
  const gameFilter = useFilterStore((s) => s.gameFilter);
  const viewMode = useFilterStore((s) => s.viewMode);
  const cheapestOnly = useFilterStore((s) => s.cheapestOnly);
  const selectedStores = useFilterStore((s) => s.selectedStores);
  const allStoresSelected = useFilterStore(selectAllStoresSelected);

  // UI store
  const filterFade = useUIStore((s) => s.filterFade);

  // Search from URL
  useEffect(() => {
    if (q && q !== prevQueryRef.current) {
      prevQueryRef.current = q;
      setQuery(q);
      queueMicrotask(() => setVisibleCount(ITEMS_PER_PAGE));
      doSearch(q);
    }
  }, [q, doSearch, setQuery]);

  // Reset visible count on filter changes
  useEffect(() => {
    queueMicrotask(() => setVisibleCount(ITEMS_PER_PAGE));
  }, [typeFilter, gameFilter]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting)
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Derived data
  const rates = useSearchStore((s) => s.rates);
  const symbol = getCurrencySymbol(currency);

  const displayPrice = useCallback(
    (amount: number, from = "USD"): string => {
      const converted = convertPrice(amount, rates, currency, from);
      return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    [rates, currency, symbol],
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
        }, new Map<string, PriceResult>())
        .values(),
    ];
  }, [cheapestOnly, filteredPrices]);

  return (
    <div className="flex-1 pb-4 relative z-10">
      <div className="max-w-5xl mx-auto px-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-[5px] border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-6 text-zinc-400 text-lg">
              Searching for the best prices...
            </p>
          </div>
        )}

        {!loading && results && (
          <>
            <PriceGrid
              prices={displayPrices || []}
              viewMode={viewMode}
              filterFade={filterFade}
              displayPrice={displayPrice}
              visibleCount={visibleCount}
              typeFilter={typeFilter}
            />
            {displayPrices && displayPrices.length > visibleCount && (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center gap-3 bg-zinc-900 rounded-lg mx-auto max-w-xs px-6 py-4"
              >
                <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-base text-zinc-300 font-medium">
                  Loading more...
                </span>
              </div>
            )}
          </>
        )}

        {!loading && !results && q && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-zinc-400 text-lg">
              No results found. Try a different search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

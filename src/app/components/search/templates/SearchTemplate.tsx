"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getCurrencySymbol } from "@/app/lib/currency";
import { convertPrice } from "@/app/lib/currency";
import { PriceGrid } from "../organisms/PriceGrid";
import { useSearchStore } from "@/app/stores/useSearchStore";
import { useFilterStore } from "@/app/stores/useFilterStore";
import { useDisplayPrices } from "@/app/stores/selectors";
import { SearchSkeleton } from "../atoms/SearchSkeleton";
const ITEMS_PER_PAGE = 21;

export const SearchTemplate = () => {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const prevQueryRef = useRef("");

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Search store
  const results = useSearchStore((s) => s.results);
  const loading = useSearchStore((s) => s.loading);
  const doSearch = useSearchStore((s) => s.doSearch);
  const setQuery = useSearchStore((s) => s.setQuery);
  const lastUpdated = useSearchStore((s) => s.lastUpdated);

  // Filter store
  const currency = useFilterStore((s) => s.currency);
  const typeFilter = useFilterStore((s) => s.typeFilter);
  const gameFilter = useFilterStore((s) => s.gameFilter);
  const viewMode = useFilterStore((s) => s.viewMode);

  // Derived
  const displayPrices = useDisplayPrices();

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
  const sentinelCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting)
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
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

  const showSkeleton = loading || (!results && !!q && !lastUpdated);

  return (
    <div className="flex-1 pb-4 relative z-10">
      <div className="max-w-5xl mx-auto px-4">
        {showSkeleton && <SearchSkeleton />}

        {!loading && results && (
          <PriceGrid
            prices={displayPrices || []}
            viewMode={viewMode}
            displayPrice={displayPrice}
            visibleCount={visibleCount}
            typeFilter={typeFilter}
            showLoadMore={!!displayPrices && displayPrices.length > visibleCount}
            sentinelRef={sentinelCallback}
          />
        )}

        {!loading && !results && q && lastUpdated && (
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

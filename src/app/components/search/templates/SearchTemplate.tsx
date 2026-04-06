"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { getCurrencySymbol } from "@/shared/lib/currency";
import { convertPrice } from "@/shared/lib/currency";
import { PriceGrid } from "../organisms/PriceGrid";
import { useSearchStore } from "@/shared/stores/useSearchStore";
import { useFilterStore } from "@/shared/stores/useFilterStore";
import { useDisplayPrices, useOtherStoresCount } from "@/shared/stores/selectors";
import { PriceGridSkeleton } from "../organisms/PriceGridSkeleton";
import { SearchFiltersSkeleton } from "../molecules/SearchFiltersSkeleton";
import { SearchFilters } from "../molecules/SearchFilters";
const ITEMS_PER_PAGE = 21;

export const SearchTemplate = () => {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const prevQueryRef = useRef("");
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");

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
  const otherStoresCount = useOtherStoresCount();
  const toggleAllStores = useFilterStore((s) => s.toggleAllStores);

  // Search from URL
  useEffect(() => {
    if (q && q !== prevQueryRef.current) {
      prevQueryRef.current = q;
      setQuery(q);
      queueMicrotask(() => {
        setLastSearchedQuery(q);
        setVisibleCount(ITEMS_PER_PAGE);
      });
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

  const queryPending = !!q && q !== lastSearchedQuery;
  const doneLoading = !loading && !queryPending && !!results;
  const hasData = doneLoading && !!displayPrices && displayPrices.length > 0;
  const showSkeleton = loading || queryPending || (!doneLoading && !!q && !lastUpdated);

  return (
    <div className="flex-1 pb-4 relative z-10">
      {showSkeleton ? <SearchFiltersSkeleton /> : <SearchFilters />}
      <div className="max-w-5xl mx-auto px-4">
        {showSkeleton && <PriceGridSkeleton />}

        {hasData && (
          <PriceGrid
            prices={displayPrices}
            viewMode={viewMode}
            displayPrice={displayPrice}
            visibleCount={visibleCount}
            typeFilter={typeFilter}
            showLoadMore={displayPrices.length > visibleCount}
            sentinelRef={sentinelCallback}
          />
        )}

        {doneLoading && (
          <>
            {displayPrices?.length === 0 && otherStoresCount === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="size-20 rounded-2xl bg-background/90 border border-border/50 flex items-center justify-center mb-5">
                  <SearchX className="size-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">No results found</h2>
                <p className="text-muted-foreground max-w-xs bg-background/90 border border-border/50 rounded-lg px-4 py-3">
                  We couldn&apos;t find any deals for that game. Try a different name or check your spelling.
                </p>
              </div>
            )}

            {displayPrices?.length === 0 && otherStoresCount > 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="size-20 rounded-2xl bg-background/90 border border-border/50 flex items-center justify-center mb-5">
                  <SearchX className="size-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">No results found</h2>
                <p className="text-muted-foreground max-w-xs mb-4">
                  No results in your selected stores, but we found some elsewhere.
                </p>
                <button
                  onClick={toggleAllStores}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium cursor-pointer hover:bg-primary/80 transition-colors"
                >
                  {otherStoresCount} result{otherStoresCount > 1 ? "s" : ""} in other stores — Show all
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !results && q && lastUpdated && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-20 rounded-2xl bg-background/90 border border-border/50 flex items-center justify-center mb-5">
              <SearchX className="size-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No results found</h2>
            <p className="text-muted-foreground max-w-xs">
              We couldn&apos;t find any deals for that game. Try a different name or check your spelling.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

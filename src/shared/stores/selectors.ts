import { useSearchStore } from "./useSearchStore";
import { useFilterStore, selectAllStoresSelected } from "./useFilterStore";
import { useMemo } from "react";
import type { PriceResult } from "../lib/stores";

export const useDisplayPrices = () => {
  const results = useSearchStore((s) => s.results);
  const typeFilter = useFilterStore((s) => s.typeFilter);
  const gameFilter = useFilterStore((s) => s.gameFilter);
  const selectedStores = useFilterStore((s) => s.selectedStores);
  const cheapestOnly = useFilterStore((s) => s.cheapestOnly);
  const allStoresSelected = useFilterStore(selectAllStoresSelected);

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

  return displayPrices;
};

export const useResultCount = () => {
  const displayPrices = useDisplayPrices();
  return displayPrices?.length;
};

export const useOtherStoresCount = () => {
  const results = useSearchStore((s) => s.results);
  const typeFilter = useFilterStore((s) => s.typeFilter);
  const gameFilter = useFilterStore((s) => s.gameFilter);
  const selectedStores = useFilterStore((s) => s.selectedStores);
  const allStoresSelected = useFilterStore(selectAllStoresSelected);

  return useMemo(() => {
    if (!results || allStoresSelected) return 0;
    return results.prices.filter((p) => {
      const matchesType = typeFilter === "all" || p.gameType === typeFilter;
      const storeName = p.store?.name || p.storeName || "";
      const matchesStore = !selectedStores.has(storeName);
      if (gameFilter === "all") return matchesType && matchesStore;
      return matchesType && matchesStore && p.gameName === gameFilter;
    }).length;
  }, [results, typeFilter, gameFilter, selectedStores, allStoresSelected]);
};

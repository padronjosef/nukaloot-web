import { useSearchStore } from "./useSearchStore";
import { useFilterStore, selectAllStoresSelected } from "./useFilterStore";
import { useMemo } from "react";
import { cheapestPerGame, matchesFilters, storeNameOf } from "./filterPrices";

export const useDisplayPrices = () => {
  const results = useSearchStore((s) => s.results);
  const selectedTypes = useFilterStore((s) => s.selectedTypes);
  const gameFilter = useFilterStore((s) => s.gameFilter);
  const selectedStores = useFilterStore((s) => s.selectedStores);
  const selectedPlatforms = useFilterStore((s) => s.selectedPlatforms);
  const cheapestOnly = useFilterStore((s) => s.cheapestOnly);
  const allStoresSelected = useFilterStore(selectAllStoresSelected);

  const allTypes = selectedTypes.length === 4;

  const filteredPrices = useMemo(
    () =>
      results?.prices.filter(
        (p) =>
          matchesFilters(p, {
            selectedTypes,
            allTypes,
            gameFilter,
            selectedPlatforms,
          }) &&
          (allStoresSelected || selectedStores.has(storeNameOf(p))),
      ),
    [
      results,
      selectedTypes,
      allTypes,
      allStoresSelected,
      selectedStores,
      selectedPlatforms,
      gameFilter,
    ],
  );

  const displayPrices = useMemo(() => {
    if (!filteredPrices) return undefined;
    if (!cheapestOnly) return filteredPrices;
    return cheapestPerGame(filteredPrices);
  }, [cheapestOnly, filteredPrices]);

  return displayPrices;
};

export const useResultCount = () => {
  const displayPrices = useDisplayPrices();
  return displayPrices?.length;
};

export const useOtherStoresCount = () => {
  const results = useSearchStore((s) => s.results);
  const selectedTypes = useFilterStore((s) => s.selectedTypes);
  const gameFilter = useFilterStore((s) => s.gameFilter);
  const selectedStores = useFilterStore((s) => s.selectedStores);
  const selectedPlatforms = useFilterStore((s) => s.selectedPlatforms);
  const allStoresSelected = useFilterStore(selectAllStoresSelected);

  const allTypes = selectedTypes.length === 4;

  return useMemo(() => {
    if (!results || allStoresSelected) return 0;
    return results.prices.filter(
      (p) =>
        matchesFilters(p, {
          selectedTypes,
          allTypes,
          gameFilter,
          selectedPlatforms,
        }) && !selectedStores.has(storeNameOf(p)),
    ).length;
  }, [
    results,
    selectedTypes,
    allTypes,
    gameFilter,
    selectedStores,
    selectedPlatforms,
    allStoresSelected,
  ]);
};

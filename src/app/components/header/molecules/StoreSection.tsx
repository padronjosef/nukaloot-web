"use client";

import { StoreList } from "./StoreList";
import { useFilterStore, selectAllStoresSelected, selectAllStoreNames } from "../../../stores/useFilterStore";
import { useSearchStore } from "../../../stores/useSearchStore";

export const StoreSection = () => {
  const selectedStores = useFilterStore((s) => s.selectedStores);
  const noneSelected = useFilterStore((s) => s.noneSelected);
  const allStoresSelected = useFilterStore(selectAllStoresSelected);
  const toggleStore = useFilterStore((s) => s.toggleStore);
  const toggleAllStores = useFilterStore((s) => s.toggleAllStores);
  const toggleGroup = useFilterStore((s) => s.toggleGroup);
  const allStoreNames = selectAllStoreNames();

  const results = useSearchStore((s) => s.results);
  const storesWithResults = new Set(
    results
      ? results.prices
          .map((p) => p.store?.name || p.storeName || "")
          .filter(Boolean)
      : [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-white uppercase tracking-wider">
          Stores
        </span>
        <button
          type="button"
          onClick={toggleAllStores}
          className={`text-xs px-2 py-1 rounded border border-zinc-600/50 cursor-pointer ${
            allStoresSelected
              ? "text-zinc-400 hover:text-zinc-200"
              : "text-blue-400 hover:text-blue-300"
          }`}
        >
          {allStoresSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      <StoreList
        allStoreNames={allStoreNames}
        selectedStores={selectedStores}
        allStoresSelected={allStoresSelected}
        noneSelected={noneSelected}
        storesWithResults={storesWithResults}
        hasResults={!!results}
        onToggleStore={toggleStore}
        onToggleGroup={toggleGroup}
        layout="stacked"
      />
    </div>
  );
};

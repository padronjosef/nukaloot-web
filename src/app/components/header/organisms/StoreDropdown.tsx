"use client";

import { Checkbox } from "@/app/components/shared/atoms/Checkbox";
import { Dropdown } from "@/app/components/shared/atoms/Dropdown";
import { StoreList } from "../molecules/StoreList";
import { useFilterStore, selectAllStoresSelected, selectAllStoreNames } from "@/app/stores/useFilterStore";
import { useSearchStore } from "@/app/stores/useSearchStore";

export const StoreDropdown = () => {
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
    <Dropdown
      trigger={
        <>
          {!allStoresSelected && (
            <span className="bg-zinc-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {noneSelected ? 0 : selectedStores.size}
            </span>
          )}
          Stores
        </>
      }
      active={!allStoresSelected}
      panelClassName="py-1 animate-fade-in-up"
    >
      <button
        type="button"
        onClick={toggleAllStores}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-700 cursor-pointer"
      >
        <Checkbox checked={allStoresSelected} />
        <span className="text-zinc-200 font-medium">All stores</span>
      </button>

      <div className="h-px bg-zinc-700 mx-2 my-1" />

      <StoreList
        allStoreNames={allStoreNames}
        selectedStores={selectedStores}
        allStoresSelected={allStoresSelected}
        noneSelected={noneSelected}
        storesWithResults={storesWithResults}
        hasResults={!!results}
        onToggleStore={toggleStore}
        onToggleGroup={toggleGroup}
        layout="columns"
      />
    </Dropdown>
  );
};

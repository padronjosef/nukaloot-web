"use client";

import { create } from "zustand";
import { STORE_ICONS, MAIN_STORES } from "../lib/stores";
import type { TypeFilter, ViewMode } from "../lib/stores";
import type { CurrencyCode } from "../lib/stores/types";

type FilterState = {
  currency: CurrencyCode;
  typeFilter: TypeFilter;
  gameFilter: string;
  viewMode: ViewMode;
  cheapestOnly: boolean;
  selectedStores: Set<string>;
  noneSelected: boolean;
}

type FilterActions = {
  setCurrency: (currency: CurrencyCode) => void;
  setTypeFilter: (filter: TypeFilter) => void;
  setGameFilter: (filter: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setCheapestOnly: (value: boolean) => void;
  toggleStore: (store: string) => void;
  toggleAllStores: () => void;
  toggleGroup: (groupStores: string[]) => void;
  hydrate: () => void;
}

const allStoreNames = Object.keys(STORE_ICONS).sort();

const getAllStoresSelected = (
  selectedStores: Set<string>,
  noneSelected: boolean,
): boolean => {
  return (
    !noneSelected &&
    (selectedStores.size === 0 || selectedStores.size === allStoreNames.length)
  );
};

const persistStores = (stores: string[], noneSelected: boolean) => {
  localStorage.setItem(
    "selected_stores",
    JSON.stringify({ stores, noneSelected }),
  );
};

export const useFilterStore = create<FilterState & FilterActions>()(
  (set, get) => ({
    // State
    currency: "USD",
    typeFilter: "all",
    gameFilter: "all",
    viewMode: "grid",
    cheapestOnly: false,
    selectedStores: new Set<string>(),
    noneSelected: false,

    // Actions
    setCurrency: (currency) => {
      set({ currency });
      localStorage.setItem("currency", currency);
    },

    setTypeFilter: (typeFilter) => set({ typeFilter }),

    setGameFilter: (gameFilter) => set({ gameFilter }),

    setViewMode: (viewMode) => {
      set({ viewMode });
      localStorage.setItem("view_mode", viewMode);
    },

    setCheapestOnly: (cheapestOnly) => {
      set({ cheapestOnly });
      localStorage.setItem("cheapest_only", String(cheapestOnly));
    },

    toggleStore: (store) => {
      const { noneSelected, selectedStores } = get();

      if (noneSelected) {
        const next = new Set([store]);
        set({ noneSelected: false, selectedStores: next });
        persistStores([...next], false);
        return;
      }

      const current =
        selectedStores.size === 0
          ? new Set(allStoreNames)
          : new Set(selectedStores);

      if (current.has(store)) current.delete(store);
      else current.add(store);

      if (current.size === allStoreNames.length) {
        set({ selectedStores: new Set(), noneSelected: false });
        persistStores([], false);
      } else if (current.size === 0) {
        set({ selectedStores: new Set(), noneSelected: true });
        persistStores([], true);
      } else {
        set({ selectedStores: current, noneSelected: false });
        persistStores([...current], false);
      }
    },

    toggleAllStores: () => {
      const { selectedStores, noneSelected } = get();
      const allSelected = getAllStoresSelected(selectedStores, noneSelected);

      if (allSelected) {
        set({ noneSelected: true, selectedStores: new Set() });
        persistStores([], true);
      } else {
        set({ noneSelected: false, selectedStores: new Set() });
        persistStores([], false);
      }
    },

    toggleGroup: (groupStores) => {
      const { noneSelected, selectedStores } = get();

      if (noneSelected) {
        const next = new Set(groupStores);
        set({ noneSelected: false, selectedStores: next });
        persistStores([...next], false);
        return;
      }

      const current =
        selectedStores.size === 0
          ? new Set(allStoreNames)
          : new Set(selectedStores);

      const allInGroup = groupStores.every((s) => current.has(s));
      if (allInGroup) {
        groupStores.forEach((s) => current.delete(s));
      } else {
        groupStores.forEach((s) => current.add(s));
      }

      if (current.size === allStoreNames.length) {
        set({ selectedStores: new Set(), noneSelected: false });
        persistStores([], false);
      } else if (current.size === 0) {
        set({ selectedStores: new Set(), noneSelected: true });
        persistStores([], true);
      } else {
        set({ selectedStores: current, noneSelected: false });
        persistStores([...current], false);
      }
    },

    hydrate: () => {
      const currency =
        (localStorage.getItem("currency") as CurrencyCode) || "USD";
      const viewMode =
        (localStorage.getItem("view_mode") as ViewMode) || "grid";
      const cheapestOnly = localStorage.getItem("cheapest_only") === "true";

      const saved = localStorage.getItem("selected_stores");
      let selectedStores = new Set<string>(MAIN_STORES);
      let noneSelected = false;

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            if (parsed.length === 1 && parsed[0] === "__none__") {
              noneSelected = true;
              selectedStores = new Set();
            } else {
              selectedStores = new Set(parsed);
            }
          } else {
            noneSelected = parsed.noneSelected ?? false;
            selectedStores = new Set(parsed.stores ?? []);
          }
        } catch {
          selectedStores = new Set(MAIN_STORES);
        }
      }

      set({ currency, viewMode, cheapestOnly, selectedStores, noneSelected });
    },
  }),
);

// Derived selectors
export const selectAllStoreNames = () => allStoreNames;
export const selectAllStoresSelected = (state: FilterState) =>
  getAllStoresSelected(state.selectedStores, state.noneSelected);

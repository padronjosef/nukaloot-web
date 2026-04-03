"use client";

import { create } from "zustand";
import { getCountryForCurrency, getExchangeRates } from "../lib/currency";
import { API_URL } from "../lib/stores";
import type { PriceResult, SearchResponse } from "../lib/stores";
import { useFilterStore } from "./useFilterStore";

let evtSource: EventSource | null = null;

type SearchState = {
  query: string;
  results: SearchResponse | null;
  loading: boolean;
  scraping: boolean;
  error: string;
  lastUpdated: Date | null;
  recentSearches: string[];
  showRecent: boolean;
  rates: Record<string, number>;
  initializing: boolean;
}

type SearchActions = {
  setQuery: (query: string) => void;
  setError: (error: string) => void;
  setShowRecent: (show: boolean) => void;
  doSearch: (rawTerm: string) => void;
  clearSearch: () => void;
  removeRecentSearch: (term: string) => void;
  initRates: () => void;
  initFromUrl: () => void;
}

export const useSearchStore = create<SearchState & SearchActions>()(
  (set, get) => ({
    // State
    query: "",
    results: null,
    loading: false,
    scraping: false,
    error: "",
    lastUpdated: null,
    recentSearches: [],
    showRecent: false,
    rates: { USD: 1 },
    initializing: true,

    // Actions
    setQuery: (query) => set({ query }),
    setError: (error) => set({ error }),
    setShowRecent: (showRecent) => set({ showRecent }),

    doSearch: (rawTerm) => {
      const term = rawTerm.replace(/\s+/g, " ").trim();
      if (term.length < 2) return;

      set({
        results: null,
        showRecent: false,
        loading: true,
        scraping: false,
        error: "",
      });

      // Reset page-level filters
      useFilterStore.getState().setGameFilter("all");

      if (evtSource) evtSource.close();

      const currency = useFilterStore.getState().currency;
      const es = new EventSource(
        `${API_URL}/search/stream?q=${encodeURIComponent(term)}&cc=${getCountryForCurrency(currency)}`,
      );
      evtSource = es;

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "pending") {
          set({ scraping: true });
        }

        if (data.type === "fast") {
          set({
            results: { game: data.game, prices: data.prices },
            lastUpdated: new Date(),
            loading: false,
          });
          if (data.prices && data.prices.length > 0) {
            const existing: string[] = JSON.parse(
              localStorage.getItem("recent_searches") || "[]",
            );
            const updated = [
              term,
              ...existing.filter(
                (s: string) => s.toLowerCase() !== term.toLowerCase(),
              ),
            ].slice(0, 6);
            set({ recentSearches: updated });
            localStorage.setItem("recent_searches", JSON.stringify(updated));
          }
        }

        if (data.type === "slow") {
          const prev = get().results;
          if (!prev) return;
          const all = [...prev.prices, ...data.prices];
          all.sort(
            (a: PriceResult, b: PriceResult) =>
              Number(a.price) - Number(b.price),
          );
          set({ results: { ...prev, prices: all } });
        }

        if (data.type === "done") {
          set({ scraping: false });
          es.close();
        }
      };

      es.onerror = () => {
        set({
          error: "Could not fetch prices. Make sure the API is running.",
          loading: false,
          scraping: false,
        });
        es.close();
      };
    },

    clearSearch: () => {
      set({
        query: "",
        results: null,
        error: "",
        lastUpdated: null,
      });
    },

    removeRecentSearch: (term) => {
      const updated = get().recentSearches.filter((s) => s !== term);
      set({ recentSearches: updated });
      localStorage.setItem("recent_searches", JSON.stringify(updated));
    },

    initRates: () => {
      getExchangeRates()
        .then((rates) => set({ rates }))
        .catch((err) => console.error("Failed to load rates:", err));
    },

    initFromUrl: () => {
      const saved = localStorage.getItem("recent_searches");
      if (saved) set({ recentSearches: JSON.parse(saved) });

      get().initRates();

      const urlQ = new URLSearchParams(window.location.search).get("q");
      if (urlQ && urlQ.trim().length >= 2) {
        queueMicrotask(() => {
          set({ query: urlQ.trim(), loading: true, initializing: false });
          get().doSearch(urlQ.trim());
        });
      } else {
        queueMicrotask(() => set({ initializing: false }));
      }
    },
  }),
);

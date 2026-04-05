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
  recentSearches: { term: string; timestamp: number }[];
  showRecent: boolean;
  rates: Record<string, number>;
  initializing: boolean;
  failedStores: Map<string, string>;
  scrapingStores: Set<string>;
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
    failedStores: new Map(),
    scrapingStores: new Set(),

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
        failedStores: new Map(),
        scrapingStores: new Set(),
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
          const latestScrapedAt = data.prices?.reduce(
            (latest: string, p: PriceResult & { scrapedAt?: string }) =>
              p.scrapedAt && p.scrapedAt > latest ? p.scrapedAt : latest,
            "",
          );
          set({
            results: { game: data.game, prices: data.prices },
            lastUpdated: latestScrapedAt ? new Date(latestScrapedAt) : new Date(),
            loading: false,
          });
          if (data.prices && data.prices.length > 0) {
            const existing: { term: string; timestamp: number }[] = JSON.parse(
              localStorage.getItem("recent_searches") || "[]",
            );
            // Migrate old string[] format
            const normalized = existing.map((s) =>
              typeof s === "string" ? { term: s, timestamp: Date.now() } : s,
            );
            const updated = [
              { term, timestamp: Date.now() },
              ...normalized.filter(
                (s) => s.term.toLowerCase() !== term.toLowerCase(),
              ),
            ].slice(0, 4);
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

        if (data.type === "scraping-store") {
          const stores = new Set(get().scrapingStores);
          if (data.status === "start") {
            stores.add(data.store);
          } else {
            stores.delete(data.store);
          }
          set({ scrapingStores: stores });
        }

        if (data.type === "scraper-error") {
          const failed = new Map(get().failedStores);
          failed.set(data.store, data.reason);
          set({ failedStores: failed });
        }

        if (data.type === "done") {
          set({ scraping: false, loading: false, lastUpdated: get().lastUpdated ?? new Date() });
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
      const updated = get().recentSearches.filter((s) => s.term !== term);
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
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old string[] format
        const normalized = parsed.map((s: string | { term: string; timestamp: number }) =>
          typeof s === "string" ? { term: s, timestamp: Date.now() } : s,
        );
        set({ recentSearches: normalized.slice(0, 4) });
      }

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

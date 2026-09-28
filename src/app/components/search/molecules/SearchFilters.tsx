"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { CheapestButton } from "@/app/components/header/atoms/CheapestButton";
import { GameNameFilter } from "@/app/components/header/molecules/GameNameFilter";
import { PlatformFilter } from "./PlatformFilter";
import { TrackGameButton } from "./TrackGameButton";
import { useFilterStore } from "@/shared/stores/useFilterStore";
import { useSearchStore } from "@/shared/stores/useSearchStore";

const CurrencySelector = dynamic(() =>
  import("@/app/components/header/molecules/CurrencySelector").then((m) => ({
    default: m.CurrencySelector,
  })),
);
const StoreDropdown = dynamic(() =>
  import("@/app/components/header/organisms/StoreDropdown").then((m) => ({
    default: m.StoreDropdown,
  })),
);

export const SearchFilters = () => {
  const currency = useFilterStore((s) => s.currency);
  const setCurrency = useFilterStore((s) => s.setCurrency);
  const cheapestOnly = useFilterStore((s) => s.cheapestOnly);
  const setCheapestOnly = useFilterStore((s) => s.setCheapestOnly);
  const gameFilter = useFilterStore((s) => s.gameFilter);
  const setGameFilter = useFilterStore((s) => s.setGameFilter);
  const rates = useSearchStore((s) => s.rates);
  const results = useSearchStore((s) => s.results);

  const gameNames = useMemo(() => {
    if (!results) return [];
    const seen = new Map<string, string>();
    for (const p of results.prices) {
      if (!seen.has(p.gameName)) {
        seen.set(p.gameName, p.releaseDate);
      }
    }
    return [...seen.entries()]
      .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
      .map(([name]) => name);
  }, [results]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 relative z-10 mb-6 mt-4 md:mt-0">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <CheapestButton
            active={cheapestOnly}
            onClick={() => setCheapestOnly(!cheapestOnly)}
          />
          <TrackGameButton />
          <CurrencySelector
            value={currency}
            onChange={setCurrency}
            availableRates={rates}
          />
          <PlatformFilter />
        </div>
        <GameNameFilter
          gameNames={gameNames}
          activeFilter={gameFilter}
          onFilterChange={setGameFilter}
          storeSlot={<StoreDropdown />}
        />
      </div>
    </div>
  );
};

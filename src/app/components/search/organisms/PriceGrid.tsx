"use client";

import { PriceCard } from "../molecules/PriceCard";
import type { PriceResult, TypeFilter, ViewMode } from "../../../lib/stores";

type PriceGridProps = {
  prices: PriceResult[];
  viewMode: ViewMode;
  filterFade: boolean;
  displayPrice: (amount: number, from?: string) => string;
  visibleCount: number;
  typeFilter: TypeFilter;
}

const TYPE_GROUPS = [
  { type: "bundle", label: "Bundles" },
  { type: "game", label: "Base Games" },
  { type: "unknown", label: "Other" },
  { type: "dlc", label: "DLCs" },
] as const;

const groupByType = (prices: PriceResult[]) => {
  return TYPE_GROUPS.map((g) => ({
    ...g,
    items: prices.filter((p) => p.gameType === g.type),
  })).filter((g) => g.items.length > 0);
};

const PriceList = ({
  prices,
  viewMode,
  filterFade,
  displayPrice,
}: {
  prices: PriceResult[];
  viewMode: ViewMode;
  filterFade: boolean;
  displayPrice: (amount: number, from?: string) => string;
}) => {
  return (
    <div
      className={`animate-fade-in-up transition-opacity duration-200 ${filterFade ? "opacity-0" : "opacity-100"} ${viewMode === "list" ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"}`}
    >
      {prices.map((price, i) => (
        <PriceCard
          key={
            price.id ||
            `${price.store?.name}-${price.gameName}-${price.productUrl}`
          }
          price={price}
          index={i}
          displayPrice={displayPrice}
          variant={viewMode}
        />
      ))}
    </div>
  );
};

export const PriceGrid = ({
  prices,
  viewMode,
  filterFade,
  displayPrice,
  visibleCount,
  typeFilter,
}: PriceGridProps) => {
  if (prices.length === 0) {
    return (
      <p className="text-zinc-400">
        {typeFilter === "all"
          ? "No prices found for this game."
          : `No ${typeFilter} prices found.`}
      </p>
    );
  }

  if (typeFilter !== "all") {
    return (
      <PriceList
        prices={prices.slice(0, visibleCount)}
        viewMode={viewMode}
        filterFade={filterFade}
        displayPrice={displayPrice}
      />
    );
  }

  const groups = groupByType(prices);
  const visibleGroups: { type: string; label: string; items: PriceResult[] }[] =
    [];
  let count = 0;
  for (const group of groups) {
    if (count >= visibleCount) break;
    const remaining = visibleCount - count;
    visibleGroups.push({ ...group, items: group.items.slice(0, remaining) });
    count += visibleGroups[visibleGroups.length - 1].items.length;
  }

  return (
    <div className="space-y-6">
      {visibleGroups.map((group) => (
        <div key={group.type}>
          <h3 className="text-base font-semibold text-white tracking-wider mb-2">
            <span className="bg-black/70 px-2 py-1 rounded">{group.label}</span>
          </h3>
          <PriceList
            prices={group.items}
            viewMode={viewMode}
            filterFade={filterFade}
            displayPrice={displayPrice}
          />
        </div>
      ))}
    </div>
  );
};

"use client";

import { AnimatePresence } from "motion/react";
import { PriceCard } from "../molecules/PriceCard";
import { SkeletonCard } from "@/app/components/shared/molecules/GameCard";
import { useGridColumns } from "@/app/hooks/useGridColumns";
import type { PriceResult, TypeFilter, ViewMode } from "@/app/lib/stores";

type PriceGridProps = {
  prices: PriceResult[];
  viewMode: ViewMode;
  displayPrice: (amount: number, from?: string) => string;
  visibleCount: number;
  typeFilter: TypeFilter;
  showLoadMore?: boolean;
  sentinelRef?: (node: HTMLDivElement | null) => void;
};

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

const getSkeletonCount = (itemCount: number, columns: number) => {
  if (columns === 1) return 1;
  const remainder = itemCount % columns;
  const fillRow = remainder === 0 ? 0 : columns - remainder;
  return fillRow + columns;
};

const PriceList = ({
  prices,
  viewMode,
  displayPrice,
  skeletonCount = 0,
}: {
  prices: PriceResult[];
  viewMode: ViewMode;
  displayPrice: (amount: number, from?: string) => string;
  skeletonCount?: number;
}) => {
  return (
    <div
      className={viewMode === "list" ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"}
    >
      <AnimatePresence mode="popLayout">
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
      </AnimatePresence>
      {skeletonCount > 0 &&
        [...Array(skeletonCount)].map((_, i) => (
          <SkeletonCard key={`skel-${i}`} />
        ))}
    </div>
  );
};

export const PriceGrid = ({
  prices,
  viewMode,
  displayPrice,
  visibleCount,
  typeFilter,
  showLoadMore = false,
  sentinelRef,
}: PriceGridProps) => {
  const columns = useGridColumns();

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
    const visible = prices.slice(0, visibleCount);
    const skeletons = showLoadMore
      ? viewMode === "list" ? 1 : getSkeletonCount(visible.length, columns)
      : 0;
    return (
      <>
        <PriceList
          prices={visible}
          viewMode={viewMode}
          displayPrice={displayPrice}
          skeletonCount={skeletons}
        />
        {showLoadMore && <div ref={sentinelRef} />}
      </>
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
      {visibleGroups.map((group, gi) => {
        const isLast = gi === visibleGroups.length - 1;
        const skeletons = showLoadMore && isLast
          ? viewMode === "list" ? 1 : getSkeletonCount(group.items.length, columns)
          : 0;
        return (
          <div key={group.type}>
            <h3 className="text-base font-semibold text-white tracking-wider mb-2">
              <span className="bg-black/70 px-2 py-1 rounded">{group.label}</span>
            </h3>
            <PriceList
              prices={group.items}
              viewMode={viewMode}
              displayPrice={displayPrice}
              skeletonCount={skeletons}
            />
          </div>
        );
      })}
      {showLoadMore && <div ref={sentinelRef} />}
    </div>
  );
};

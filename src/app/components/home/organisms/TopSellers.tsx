"use client";

import { GameCard } from "@/app/components/shared/molecules/GameCard";
import { useFilterStore } from "@/shared/stores/useFilterStore";

type TopSellerGame = {
  name: string;
  appId: number;
  image: string;
  url: string;
}

type TopSellersProps = {
  games: TopSellerGame[];
  onSelect: (name: string) => void;
}

export const TopSellers = ({
  games,
  onSelect,
}: TopSellersProps) => {
  const viewMode = useFilterStore((s) => s.viewMode);

  if (games.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-6 relative z-10">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-foreground">Top Sellers</h2>
        <p className="text-sm text-muted-foreground mt-1">Best selling games on Steam.</p>
      </div>
      <div
        className={`animate-fade-in-up ${viewMode === "list" ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"}`}
      >
        {games.map((game) => (
            <GameCard
              key={game.appId}
              onClick={() => onSelect(game.name)}
              image={game.image}
              name={game.name}
              variant={viewMode}
            />
          ))}
      </div>
    </div>
  );
};

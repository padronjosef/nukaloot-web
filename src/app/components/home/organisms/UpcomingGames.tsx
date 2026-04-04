"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GameCard } from "@/app/components/shared/molecules/GameCard";
import { API_URL } from "@/app/lib/stores";
import { useFilterStore } from "@/app/stores/useFilterStore";
import { UpcomingGamesSkeleton } from "./UpcomingGamesSkeleton";

type UpcomingGame = {
  name: string;
  appId: number;
  image: string;
  url: string;
}

const steamIcon = (
  <Image
    src="/store-icons/steam.png"
    alt="Steam"
    width={20}
    height={20}
    className="inline-block rounded-sm"
  />
);

type UpcomingGamesProps = {
  onRateLimited?: () => void;
}

export const UpcomingGames = ({
  onRateLimited,
}: UpcomingGamesProps) => {
  const viewMode = useFilterStore((s) => s.viewMode);
  const [games, setGames] = useState<UpcomingGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/games/upcoming`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.rateLimited) onRateLimited?.();
        setGames(
          Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
              ? data
              : [],
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [onRateLimited]);

  if (loading) return <UpcomingGamesSkeleton />;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-6 relative z-10">
      <h2 className="text-lg font-bold text-white mb-3">
        <span className="bg-black/70 px-2 py-1 rounded">Upcoming Games</span>
      </h2>
      <div
        className={`animate-fade-in-up ${viewMode === "list" ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"}`}
      >
        {games.map((game) => (
            <GameCard
              key={game.appId}
              href={game.url}
              image={game.image}
              name={game.name}
              variant={viewMode}
              storeIcon={steamIcon}
              bottomRight={
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500 text-white font-medium">
                  Coming Soon
                </span>
              }
            />
          ))}
      </div>
    </div>
  );
};

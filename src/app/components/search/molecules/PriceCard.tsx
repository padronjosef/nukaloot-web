"use client";

import { GameCard } from "../../shared/molecules/GameCard";
import { StoreIcon } from "../../shared/atoms/StoreIcon";
import type { PriceResult } from "../../../lib/stores";

type PriceCardProps = {
  price: PriceResult;
  index: number;
  displayPrice: (amount: number, from?: string) => string;
  variant?: "grid" | "list";
}

export const PriceCard = ({
  price,
  index,
  displayPrice,
  variant = "grid",
}: PriceCardProps) => {
  const badges = [];
  if (price.gameType === "dlc")
    badges.push({ label: "DLC", className: "bg-orange-500" });
  if (price.gameType === "bundle")
    badges.push({ label: "Bundle", className: "bg-purple-500" });
  const priceCurrency = price.currency || "USD";

  return (
    <GameCard
      href={price.productUrl}
      image={price.imageUrl}
      name={price.gameName}
      badges={badges}
      variant={variant}
      storeIcon={
        <StoreIcon storeName={price.store?.name || price.storeName || ""} />
      }
      bottomRight={
        <div
          className={`flex flex-col items-end ${variant === "grid" ? "bg-black/70 rounded px-2 py-1" : ""}`}
        >
          {price.originalPrice && price.originalPrice > price.price && (
            <span className="text-xs text-zinc-200 line-through">
              {displayPrice(Number(price.originalPrice), priceCurrency)}
            </span>
          )}
          <span
            className={`font-bold ${variant === "list" ? "text-base" : "text-lg"} ${
              index === 0 ? "text-green-400" : "text-white"
            }`}
          >
            {displayPrice(Number(price.price), priceCurrency)}
          </span>
        </div>
      }
    />
  );
};

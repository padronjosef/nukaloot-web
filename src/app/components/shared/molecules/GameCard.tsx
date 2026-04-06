"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Skeleton } from "@/shared/UI/Skeleton";
import { Gamepad2, Share2 } from "lucide-react";

const ImageFallback = () => (
  <div className="absolute inset-0 bg-muted flex items-center justify-center">
    <Gamepad2 className="size-12 text-muted-foreground/40" />
  </div>
);

type Badge = {
  label: string;
  className: string;
};

type GameCardProps = {
  href?: string;
  onClick?: () => void;
  image: string;
  name: string;
  badges?: Badge[];
  storeIcon?: React.ReactNode;
  storeName?: string;
  price?: React.ReactNode;
  originalPrice?: React.ReactNode;
  discount?: string;
  updatedAt?: string;
  bottomRight?: React.ReactNode;
  variant?: "grid" | "list";
  priority?: boolean;
};

const cardAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const GameCard = ({
  href,
  onClick,
  image,
  name,
  badges,
  storeIcon,
  storeName,
  price,
  originalPrice,
  discount,
  updatedAt,
  bottomRight,
  variant = "grid",
  priority = false,
}: GameCardProps) => {
  const [imgError, setImgError] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = href || window.location.href;
    navigator.clipboard.writeText(url);
  };

  const linkProps = onClick
    ? { onClick, role: "button" as const }
    : { href, target: "_blank" as const, rel: "noopener noreferrer" };

  if (variant === "list") {
    return (
      <motion.a
        {...linkProps}
        className="group flex items-start gap-4 p-3 rounded-lg border border-border/50 hover:border-border transition-colors duration-300 cursor-pointer bg-background/90"
        layout
        {...cardAnimation}
      >
        <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
          {!image || imgError ? (
            <ImageFallback />
          ) : (
            <Image
              src={image}
              alt={name}
              fill
              sizes="64px"
              loading={priority ? "eager" : "lazy"}

              onError={() => setImgError(true)}
              className="object-cover"
            />
          )}
          {/* Mobile badges on image */}
          {badges && badges.length > 0 && (
            <div className="md:hidden absolute top-0 left-0 flex gap-1 p-0.5">
              {badges.map((b) => (
                <span
                  key={b.label}
                  className={`text-[10px] px-1 py-0.5 rounded text-foreground font-medium ${b.className}`}
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between w-full h-16 min-w-0">
          <div className="flex items-center gap-2">
            {badges?.map((b) => (
              <span
                key={b.label}
                className={`hidden md:inline text-xs px-1.5 py-0.5 rounded text-foreground font-medium shrink-0 ${b.className}`}
              >
                {b.label}
              </span>
            ))}

            <span className="text-sm font-bold text-foreground line-clamp-1">
              {name}
            </span>

            {/* Desktop price: inline right */}
            {(price || bottomRight) && (
              <div className="hidden md:block shrink-0 ml-auto text-right">
                {price ? (
                  <span className="text-xl font-bold">{price}</span>
                ) : (
                  bottomRight
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {storeIcon}

              {storeName && (
                <span className="hidden md:inline text-xs text-muted-foreground uppercase tracking-wider">
                  {storeName}
                </span>
              )}
            </div>

            {/* Mobile price: bottom right */}
            {(price || bottomRight) && (
              <div className="md:hidden shrink-0 text-right">
                {price ? (
                  <span className="text-lg font-bold">{price}</span>
                ) : (
                  bottomRight
                )}
              </div>
            )}
          </div>
        </div>
      </motion.a>
    );
  }

  return (
    <motion.a
      {...linkProps}
      className="group flex flex-col rounded-sm border border-border/50 overflow-hidden cursor-pointer hover:border-border transition-colors duration-300 bg-background/90"
      layout
      {...cardAnimation}
    >
      {/* Image */}
      <div className="relative aspect-[16/7.2] overflow-hidden">
        {!image || imgError ? (
          <ImageFallback />
        ) : (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            loading={priority ? "eager" : "lazy"}

            onError={() => setImgError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        )}
        {/* Badges on image */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {discount && (
            <span className="text-xs font-bold px-2 py-1 rounded bg-primary text-primary-foreground">
              {discount}
            </span>
          )}
          {badges?.map((b) => (
            <span
              key={b.label}
              className={`text-xs font-bold px-2 py-1 rounded text-foreground ${b.className}`}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3">
        {/* Name + Share */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground line-clamp-2 min-h-[2.8em]">
            {name}
          </h3>
          {href && (
            <button
              onClick={handleShare}
              className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Share2 className="size-4" />
            </button>
          )}
        </div>

        {/* Price */}
        {price && (
          <div className="flex items-baseline gap-2 justify-end">
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {originalPrice}
              </span>
            )}
            <span className="text-xl font-bold text-primary">{price}</span>
          </div>
        )}

        {/* Store row */}
        {(storeIcon || storeName || updatedAt || bottomRight) && (
          <div className="flex items-end gap-2 pt-2 border-t border-border/50">
            {storeIcon}
            {storeName && (
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {storeName}
              </span>
            )}
            <div className="ml-auto flex items-end gap-2">
              {updatedAt && (
                <span className="text-xs text-muted-foreground italic">
                  {updatedAt}
                </span>
              )}
              {bottomRight}
            </div>
          </div>
        )}
      </div>
    </motion.a>
  );
};

export const SkeletonCard = () => (
  <div className="flex flex-col rounded-sm border border-border/50 overflow-hidden bg-background">
    <Skeleton className="aspect-[16/7.2] rounded-none" />
    <div className="p-3 flex flex-col gap-2">
      {/* Name + Share */}
      <div className="flex items-start justify-between gap-2 min-h-[2.8em]">
        <div className="flex-1 flex flex-col gap-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="size-4 shrink-0 mt-0.5" />
      </div>
      {/* Price */}
      <div className="flex items-baseline gap-2 justify-end">
        <Skeleton className="h-3.5 w-14" />
        <Skeleton className="h-6 w-20" />
      </div>
      {/* Store row */}
      <div className="flex items-end gap-2 pt-2 border-t border-border/50">
        <Skeleton className="size-5 rounded" />
        <Skeleton className="h-3 w-20" />
        <div className="ml-auto">
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  </div>
);

"use client";

import { useState } from "react";
import Image from "next/image";
import { Skeleton } from "../atoms/Skeleton";

const ImageFallback = () => {
  return (
    <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-zinc-600"
      >
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="9" cy="12" r="2" />
        <path d="M15 10v4M13 12h4" />
      </svg>
    </div>
  );
};

type Badge = {
  label: string;
  className: string;
}

type GameCardProps = {
  href: string;
  image: string;
  name: string;
  badges?: Badge[];
  storeIcon?: React.ReactNode;
  bottomRight?: React.ReactNode;
  variant?: "grid" | "list";
}

export const GameCard = ({
  href,
  image,
  name,
  badges,
  storeIcon,
  bottomRight,
  variant = "grid",
}: GameCardProps) => {
  const [imgError, setImgError] = useState(false);

  if (variant === "list") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-4 p-3 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-all duration-300 cursor-pointer bg-zinc-900/80"
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
              onError={() => setImgError(true)}
              className="object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-white line-clamp-1">
            {name}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {storeIcon}
            {badges?.map((b) => (
              <span
                key={b.label}
                className={`text-xs px-1.5 py-0.5 rounded text-white font-medium ${b.className}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
        {bottomRight && <div className="shrink-0">{bottomRight}</div>}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col justify-between rounded-lg border border-zinc-700/50 overflow-hidden h-47.5 cursor-pointer transition-all duration-300"
    >
      {!image || imgError ? (
        <ImageFallback />
      ) : (
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          onError={() => setImgError(true)}
          className="object-cover brightness-[0.9] group-hover:brightness-[0.95] group-hover:scale-105 transition-all duration-500 ease-out"
        />
      )}
      <div className="relative p-3">
        <span className="bg-black/70 text-white text-sm font-bold px-2 py-1 rounded leading-snug line-clamp-2 block w-fit">
          {name}
        </span>
      </div>
      <div className="relative p-3 flex items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          {storeIcon}
          {badges?.map((b) => (
            <span
              key={b.label}
              className={`text-sm px-2 py-0.5 rounded text-white font-medium ${b.className}`}
            >
              {b.label}
            </span>
          ))}
        </div>
        {bottomRight}
      </div>
    </a>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="relative flex flex-col justify-between rounded-lg border border-zinc-700/50 overflow-hidden h-47.5">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="relative p-3">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="relative p-3 flex items-end justify-between">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
};

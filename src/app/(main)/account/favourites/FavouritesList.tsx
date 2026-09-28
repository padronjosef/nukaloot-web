"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, Gamepad2, Star } from "lucide-react";
import { Button } from "@/shared/UI/Button";
import { PlatformMark } from "@/app/components/header/atoms/PlatformMark";
import { PLATFORM_LABELS, toPlatform } from "@/shared/lib/stores/types";
import { useFavouritesStore } from "@/shared/stores/useFavouritesStore";
import type { FavouriteItem } from "@/shared/lib/favourites";
import { GamePlatforms } from "./GamePlatforms";

const money = (amount: number, currency: string | null) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);

const Row = ({ item }: { item: FavouriteItem }) => {
  const router = useRouter();
  const remove = useFavouritesStore((s) => s.remove);
  const pending = useFavouritesStore((s) => s.pending);
  const platform = toPlatform(item.platform);

  return (
    <li className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded bg-muted">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt={item.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Gamepad2 className="size-6 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => router.push(`/search?q=${encodeURIComponent(item.name)}`)}
          className="cursor-pointer truncate text-left text-sm font-medium text-foreground hover:underline"
        >
          {item.name}
        </button>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {item.bestPrice === null ? (
            // Never blank without saying why: no price here means nothing is
            // listed on the platforms this account tracks, which is a setting
            // they can change rather than something broken.
            <span className="italic">
              No price on your platforms yet
            </span>
          ) : (
            <>
              <PlatformMark platform={platform} className="size-3.5" />
              <span className="sr-only">{PLATFORM_LABELS[platform]}</span>
              <span className="font-medium text-foreground">
                {money(item.bestPrice, item.currency)}
              </span>
              {item.storeName ? <span>at {item.storeName}</span> : null}
            </>
          )}
        </p>
        <GamePlatforms item={item} />
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={pending === item.slug}
        onClick={() => void remove(item.gameId, item.slug)}
        className="shrink-0"
      >
        Remove
      </Button>
    </li>
  );
};

export const FavouritesList = ({ signedIn }: { signedIn: boolean }) => {
  const setSignedIn = useFavouritesStore((s) => s.setSignedIn);
  const load = useFavouritesStore((s) => s.load);
  const loaded = useFavouritesStore((s) => s.loaded);
  const items = useFavouritesStore((s) => s.items);
  const tracked = useFavouritesStore((s) => s.tracked);
  const limit = useFavouritesStore((s) => s.limit);
  const error = useFavouritesStore((s) => s.error);

  useEffect(() => {
    setSignedIn(signedIn);
    if (signedIn) void load();
  }, [signedIn, setSignedIn, load]);

  if (error && !loaded) {
    return (
      <p className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-4 text-sm text-destructive">
        <AlertCircle className="size-4" />
        {error}
      </p>
    );
  }

  if (!loaded) {
    return (
      <ul className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="h-20 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <Star className="mx-auto size-6 text-muted-foreground/40" />
        <p className="mt-2 text-sm italic text-muted-foreground">
          Nothing tracked yet. Search for a game and hit Track price.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        Tracking {tracked} of {limit}.
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <Row key={item.gameId} item={item} />
        ))}
      </ul>
    </>
  );
};

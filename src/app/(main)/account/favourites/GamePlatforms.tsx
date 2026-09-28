"use client";

import { PlatformMark } from "@/app/components/header/atoms/PlatformMark";
import { PLATFORMS, PLATFORM_LABELS, toPlatform } from "@/shared/lib/stores/types";
import type { Platform } from "@/shared/lib/stores/types";
import { useFavouritesStore } from "@/shared/stores/useFavouritesStore";
import { cn } from "@/shared/lib/utils";
import type { FavouriteItem } from "@/shared/lib/favourites";

/**
 * Per-game platforms, overriding the account for this one title — somebody
 * may own a PC and a Switch and want only the Switch price for one game.
 *
 * "Follow account" is offered as its own choice rather than left to be
 * guessed: clearing an override and selecting nothing look the same in a row
 * of toggles, and they mean opposite things.
 */
export const GamePlatforms = ({ item }: { item: FavouriteItem }) => {
  const setGamePlatforms = useFavouritesStore((s) => s.setGamePlatforms);
  const pending = useFavouritesStore((s) => s.pending);
  const busy = pending === item.slug;

  const own = item.platformsAreOwn === true;
  const chosen = new Set<Platform>(
    (item.platforms ?? ["pc"]).map((p) => toPlatform(p)),
  );

  const toggle = (platform: Platform) => {
    const next = new Set(chosen);
    if (next.has(platform)) {
      next.delete(platform);
    } else {
      next.add(platform);
    }
    // The server refuses an empty list, so the last one stays on rather than
    // bouncing off and back with an error.
    if (next.size === 0) return;
    void setGamePlatforms(item.gameId, item.slug, [...next]);
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      {PLATFORMS.map((platform) => {
        const on = chosen.has(platform);
        return (
          <button
            key={platform}
            type="button"
            disabled={busy}
            aria-pressed={on}
            title={`${PLATFORM_LABELS[platform]} for ${item.name}`}
            onClick={() => toggle(platform)}
            className={cn(
              "flex size-7 items-center justify-center rounded border transition-colors",
              busy ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <PlatformMark platform={platform} className="size-3.5" />
            <span className="sr-only">{PLATFORM_LABELS[platform]}</span>
          </button>
        );
      })}

      {own ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void setGamePlatforms(item.gameId, item.slug, null)}
          className={cn(
            "ml-1 rounded px-1.5 py-1 text-[11px] text-muted-foreground underline-offset-2 hover:underline",
            busy ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          )}
        >
          Follow account
        </button>
      ) : (
        <span className="ml-1 text-[11px] text-muted-foreground">
          Following your account
        </span>
      )}
    </div>
  );
};

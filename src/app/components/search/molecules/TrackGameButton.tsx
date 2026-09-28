"use client";

import { Star } from "lucide-react";
import { Button } from "@/shared/UI/Button";
import { useFavouritesStore } from "@/shared/stores/useFavouritesStore";
import { useSearchStore } from "@/shared/stores/useSearchStore";
import { useUIStore } from "@/shared/stores/useUIStore";

/**
 * Saves the game this search is about.
 *
 * Deliberately one button for the whole result set rather than a star on every
 * card. What gets saved is the *game*, and the cards are listings of it —
 * fifteen stars that all do the same thing would read as fifteen different
 * things, and saving "Dark Souls 3 - Pc (Steam)" would file a second game
 * beside "Dark Souls Iii".
 *
 * It says the game's name for the same reason: so there is no doubt about what
 * a click is about to save.
 */
export const TrackGameButton = () => {
  const results = useSearchStore((s) => s.results);
  const signedIn = useFavouritesStore((s) => s.signedIn);
  const loaded = useFavouritesStore((s) => s.loaded);
  const idBySlug = useFavouritesStore((s) => s.idBySlug);
  const pending = useFavouritesStore((s) => s.pending);
  const toggle = useFavouritesStore((s) => s.toggle);
  const setSignInOpen = useUIStore((s) => s.setSignInOpen);

  const game = results?.game;
  if (!game) return null;

  const saved = Object.prototype.hasOwnProperty.call(idBySlug, game.slug);
  const busy = pending === game.slug;
  // Until the list has arrived a hollow star would be a guess, and clicking it
  // would try to add a game that is already there.
  const unknown = signedIn && !loaded;

  const label = saved ? "Tracking" : "Track price";

  return (
    <Button
      variant={saved ? "default" : "outline"}
      className="w-fit shrink-0"
      disabled={busy || unknown}
      aria-pressed={saved}
      title={
        signedIn
          ? `${saved ? "Stop tracking" : "Track"} ${game.name}`
          : "Sign in to track this game's price"
      }
      onClick={() => {
        // Not signed in: open the dialog instead of firing a request that can
        // only come back 401.
        if (!signedIn) {
          setSignInOpen(true);
          return;
        }
        void toggle(game);
      }}
    >
      <Star className={`size-4 ${saved ? "fill-current" : ""}`} />
      {label}
    </Button>
  );
};

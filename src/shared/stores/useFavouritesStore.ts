"use client";

import { create } from "zustand";
import type { FavouriteItem, FavouriteList } from "@/shared/lib/favourites";

/** The game a search is about — never a single listing's title. */
export type FavouriteGame = { name: string; slug: string };

type FavouritesState = {
  signedIn: boolean;
  /** Whether the list has been fetched, so the heart is not drawn from nothing. */
  loaded: boolean;
  /** gameId by slug, for the games on the list. Slug is what a search knows. */
  idBySlug: Record<string, string>;
  items: FavouriteItem[];
  tracked: number;
  limit: number;
  /** The slug of a game whose add or remove is in flight. */
  pending: string | null;
  error: string | null;
};

type FavouritesActions = {
  setSignedIn: (signedIn: boolean) => void;
  load: () => Promise<void>;
  toggle: (game: FavouriteGame) => Promise<void>;
  remove: (gameId: string, slug: string) => Promise<void>;
  setGamePlatforms: (
    gameId: string,
    slug: string,
    platforms: string[] | null,
  ) => Promise<void>;
  clearError: () => void;
};

const message = async (res: Response, fallback: string) => {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error || fallback;
  } catch {
    return fallback;
  }
};

export const useFavouritesStore = create<FavouritesState & FavouritesActions>()(
  (set, get) => ({
    signedIn: false,
    loaded: false,
    idBySlug: {},
    items: [],
    tracked: 0,
    limit: 0,
    pending: null,
    error: null,

    setSignedIn: (signedIn) => {
      if (get().signedIn === signedIn) return;
      // Signing out has to empty the list, or the next person on this browser
      // sees hearts filled for somebody else's games.
      set(
        signedIn
          ? { signedIn }
          : {
              signedIn,
              loaded: false,
              idBySlug: {},
              items: [],
              tracked: 0,
              error: null,
            },
      );
    },

    load: async () => {
      if (!get().signedIn) return;
      try {
        const res = await fetch("/api/account/favourites");
        if (!res.ok) throw new Error(await message(res, "Could not load."));
        const data = (await res.json()) as FavouriteList;

        set({
          loaded: true,
          items: data.items,
          tracked: data.tracked,
          limit: data.limit,
          idBySlug: Object.fromEntries(
            data.items.map((item) => [item.slug, item.gameId]),
          ),
        });
      } catch (error) {
        // A list that failed to load must not read as an empty list, or every
        // heart shows hollow and clicking one tries to add it again.
        set({
          error: error instanceof Error ? error.message : "Could not load.",
        });
      }
    },

    toggle: async (game) => {
      const { signedIn, idBySlug, pending } = get();
      if (!signedIn || pending) return;

      const existing = idBySlug[game.slug];
      if (existing) {
        await get().remove(existing, game.slug);
        return;
      }

      // Optimistic: the heart fills at once, and goes back if the server says
      // no — a limit reached, a session that expired.
      set({
        pending: game.slug,
        error: null,
        idBySlug: { ...idBySlug, [game.slug]: "" },
      });

      try {
        const res = await fetch("/api/account/favourites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameName: game.name }),
        });
        if (!res.ok) throw new Error(await message(res, "Could not save."));

        const data = (await res.json()) as {
          item: FavouriteItem;
          tracked: number;
          limit: number;
        };

        set((s) => ({
          pending: null,
          tracked: data.tracked,
          limit: data.limit,
          idBySlug: { ...s.idBySlug, [game.slug]: data.item.gameId },
          items: [data.item, ...s.items.filter((i) => i.slug !== game.slug)],
        }));
      } catch (error) {
        set((s) => {
          const next = { ...s.idBySlug };
          delete next[game.slug];
          return {
            pending: null,
            idBySlug: next,
            error: error instanceof Error ? error.message : "Could not save.",
          };
        });
      }
    },

    remove: async (gameId, slug) => {
      const before = get().idBySlug;
      const beforeItems = get().items;
      const next = { ...before };
      delete next[slug];

      set({
        pending: slug,
        error: null,
        idBySlug: next,
        items: beforeItems.filter((i) => i.slug !== slug),
        tracked: Math.max(0, get().tracked - 1),
      });

      try {
        const res = await fetch(
          `/api/account/favourites/${encodeURIComponent(gameId)}`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error(await message(res, "Could not remove."));
        set({ pending: null });
      } catch (error) {
        // Put it back. A heart that emptied on a failed request is a lie the
        // person only finds out about on the next page load.
        set({
          pending: null,
          idBySlug: before,
          items: beforeItems,
          tracked: beforeItems.length,
          error: error instanceof Error ? error.message : "Could not remove.",
        });
      }
    },

    /**
     * Which platforms to price one saved game on. Passing null clears the
     * override so it follows the account again — not the same as an empty
     * list, which the server refuses.
     */
    setGamePlatforms: async (gameId, slug, platforms) => {
      if (get().pending) return;
      set({ pending: slug, error: null });

      try {
        const res = await fetch(
          `/api/account/favourites/${encodeURIComponent(gameId)}/platforms`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platforms }),
          },
        );
        if (!res.ok) throw new Error(await message(res, "Could not save."));

        // Not optimistic on purpose: changing platforms changes the *price*
        // shown, and only the server knows what that price is. Guessing here
        // would put a number on screen that the next reload contradicts.
        set({ pending: null });
        await get().load();
      } catch (error) {
        set({
          pending: null,
          error: error instanceof Error ? error.message : "Could not save.",
        });
      }
    },

    clearError: () => set({ error: null }),
  }),
);

export const selectIsFavourite = (slug: string) => (s: FavouritesState) =>
  Object.prototype.hasOwnProperty.call(s.idBySlug, slug);

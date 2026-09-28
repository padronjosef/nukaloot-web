import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFavouritesStore } from "./useFavouritesStore";
import type { FavouriteItem } from "@/shared/lib/favourites";

/**
 * The star updates before the server has answered, which is what makes it feel
 * instant — and what makes it able to lie. Most of what follows checks that it
 * goes back when the answer is no: a limit reached, a session that expired, a
 * request that never arrived.
 */
const game = { name: "Elden Ring", slug: "elden-ring" };

const item = (over: Partial<FavouriteItem> = {}): FavouriteItem => ({
  gameId: "game-1",
  name: game.name,
  slug: game.slug,
  coverUrl: null,
  addedAt: "2026-09-19T00:00:00Z",
  source: "manual",
  tracked: true,
  priceWhenAdded: null,
  bestPrice: 40,
  currency: "USD",
  storeName: "Kinguin",
  productUrl: "https://example.test/x",
  scrapedAt: null,
  ...over,
});

const ok = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as Response;

const reset = () =>
  useFavouritesStore.setState({
    signedIn: false,
    loaded: false,
    idBySlug: {},
    items: [],
    tracked: 0,
    limit: 0,
    pending: null,
    error: null,
  });

const state = () => useFavouritesStore.getState();

describe("favourites store", () => {
  beforeEach(() => {
    reset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("loading the list", () => {
    it("fills the list and the lookup", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve(ok({ items: [item()], tracked: 1, limit: 100 })),
        ),
      );
      useFavouritesStore.setState({ signedIn: true });

      await state().load();

      expect(state().loaded).toBe(true);
      expect(state().idBySlug).toEqual({ "elden-ring": "game-1" });
      expect(state().limit).toBe(100);
    });

    it("does not call the API when nobody is signed in", async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      await state().load();

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("does not pretend an empty list when loading failed", async () => {
      // A failed load that looked like "no favourites" would draw every star
      // hollow, and clicking one would try to add a game already on the list.
      vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(ok({}, 500))));
      useFavouritesStore.setState({ signedIn: true });

      await state().load();

      expect(state().loaded).toBe(false);
      expect(state().error).toBeTruthy();
    });

    it("survives a response that is not JSON", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 502,
            json: () => Promise.reject(new Error("not json")),
          } as unknown as Response),
        ),
      );
      useFavouritesStore.setState({ signedIn: true });

      await state().load();

      expect(state().loaded).toBe(false);
      expect(state().error).toBeTruthy();
    });
  });

  describe("adding", () => {
    it("fills the star before the server answers, and keeps it", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve(ok({ item: item(), tracked: 1, limit: 100 })),
        ),
      );
      useFavouritesStore.setState({ signedIn: true, loaded: true });

      await state().toggle(game);

      expect(state().idBySlug["elden-ring"]).toBe("game-1");
      expect(state().items).toHaveLength(1);
      expect(state().tracked).toBe(1);
      expect(state().pending).toBeNull();
    });

    describe("what it must undo", () => {
      it("empties the star again when the limit is reached", async () => {
        // The server is the only thing that knows the real count, and its
        // message is the one worth showing.
        vi.stubGlobal(
          "fetch",
          vi.fn(() =>
            Promise.resolve(
              ok({ error: "You can track 100 games at once." }, 400),
            ),
          ),
        );
        useFavouritesStore.setState({ signedIn: true, loaded: true });

        await state().toggle(game);

        expect(state().idBySlug).toEqual({});
        expect(state().items).toEqual([]);
        expect(state().error).toMatch(/100 games/);
      });

      it("empties the star again when the session expired", async () => {
        vi.stubGlobal(
          "fetch",
          vi.fn(() => Promise.resolve(ok({ error: "Not signed in." }, 401))),
        );
        useFavouritesStore.setState({ signedIn: true, loaded: true });

        await state().toggle(game);

        expect(state().idBySlug).toEqual({});
      });

      it("empties the star again when the request never arrived", async () => {
        vi.stubGlobal(
          "fetch",
          vi.fn(() => Promise.reject(new Error("offline"))),
        );
        useFavouritesStore.setState({ signedIn: true, loaded: true });

        await state().toggle(game);

        expect(state().idBySlug).toEqual({});
        expect(state().pending).toBeNull();
        expect(state().error).toBe("offline");
      });
    });

    it("does nothing at all when nobody is signed in", async () => {
      // The button opens the sign-in dialog instead; firing a request that can
      // only come back 401 would flash a star and an error for nothing.
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      await state().toggle(game);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(state().idBySlug).toEqual({});
    });

    it("ignores a second click while the first is in flight", async () => {
      const fetchMock = vi.fn(
        () => new Promise<Response>(() => {}), // never settles
      );
      vi.stubGlobal("fetch", fetchMock);
      useFavouritesStore.setState({ signedIn: true, loaded: true });

      void state().toggle(game);
      await state().toggle(game);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("removing", () => {
    const withOne = () =>
      useFavouritesStore.setState({
        signedIn: true,
        loaded: true,
        idBySlug: { "elden-ring": "game-1" },
        items: [item()],
        tracked: 1,
      });

    it("takes it off the list", async () => {
      vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(ok(null, 204))));
      withOne();

      await state().toggle(game);

      expect(state().idBySlug).toEqual({});
      expect(state().items).toEqual([]);
      expect(state().tracked).toBe(0);
    });

    it("puts it back when the server refused", async () => {
      // A star that emptied on a failed request is a lie the person only finds
      // out about on the next page load.
      vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(ok({}, 500))));
      withOne();

      await state().toggle(game);

      expect(state().idBySlug).toEqual({ "elden-ring": "game-1" });
      expect(state().items).toHaveLength(1);
      expect(state().tracked).toBe(1);
      expect(state().error).toBeTruthy();
    });

    it("sends the game id, not the slug", async () => {
      // The API deletes by id; sending the slug would quietly delete nothing.
      const fetchMock = vi.fn(() => Promise.resolve(ok(null, 204)));
      vi.stubGlobal("fetch", fetchMock);
      withOne();

      await state().toggle(game);

      expect(fetchMock).toHaveBeenCalledWith(
        "/api/account/favourites/game-1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("one game's platforms", () => {
    const withOne = () =>
      useFavouritesStore.setState({
        signedIn: true,
        loaded: true,
        idBySlug: { "elden-ring": "game-1" },
        items: [item()],
        tracked: 1,
      });

    it("sends the override and re-reads the list", async () => {
      // Not optimistic: changing platforms changes the price shown, and only
      // the server knows what that price is.
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(ok({ platforms: ["xbox"] }))
        .mockResolvedValueOnce(
          ok({ items: [item({ bestPrice: 12 })], tracked: 1, limit: 100 }),
        );
      vi.stubGlobal("fetch", fetchMock);
      withOne();

      await state().setGamePlatforms("game-1", "elden-ring", ["xbox"]);

      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "/api/account/favourites/game-1/platforms",
        expect.objectContaining({ method: "PATCH" }),
      );
      expect(state().items[0].bestPrice).toBe(12);
      expect(state().pending).toBeNull();
    });

    it("sends null to go back to following the account", async () => {
      // null and [] mean opposite things — one clears the override, the other
      // is refused — so the null has to survive the trip.
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(ok({ platforms: ["pc"] }))
        .mockResolvedValueOnce(ok({ items: [], tracked: 0, limit: 100 }));
      vi.stubGlobal("fetch", fetchMock);
      withOne();

      await state().setGamePlatforms("game-1", "elden-ring", null);

      const body = (fetchMock.mock.calls[0][1] as { body: string }).body;
      expect(JSON.parse(body)).toEqual({ platforms: null });
    });

    it("reports a refusal instead of leaving it looking saved", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(ok({ error: "Pick at least one." }, 400))),
      );
      withOne();

      await state().setGamePlatforms("game-1", "elden-ring", []);

      expect(state().error).toMatch(/at least one/i);
      expect(state().pending).toBeNull();
    });

    it("does not re-read the list when the write failed", async () => {
      // Reloading after a failure would paint the old value as if it were the
      // new one.
      const fetchMock = vi.fn(() => Promise.resolve(ok({}, 500)));
      vi.stubGlobal("fetch", fetchMock);
      withOne();

      await state().setGamePlatforms("game-1", "elden-ring", ["xbox"]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("ignores a click while another change is in flight", async () => {
      const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
      vi.stubGlobal("fetch", fetchMock);
      withOne();

      void state().setGamePlatforms("game-1", "elden-ring", ["xbox"]);
      await state().setGamePlatforms("game-1", "elden-ring", ["pc"]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("signing out", () => {
    it("empties the list", async () => {
      // Otherwise the next person on this browser sees stars filled for
      // somebody else's games.
      useFavouritesStore.setState({
        signedIn: true,
        loaded: true,
        idBySlug: { "elden-ring": "game-1" },
        items: [item()],
        tracked: 1,
      });

      state().setSignedIn(false);

      expect(state().idBySlug).toEqual({});
      expect(state().items).toEqual([]);
      expect(state().loaded).toBe(false);
      expect(state().tracked).toBe(0);
    });

    it("does not wipe anything when the flag has not changed", async () => {
      useFavouritesStore.setState({
        signedIn: true,
        loaded: true,
        idBySlug: { "elden-ring": "game-1" },
      });

      state().setSignedIn(true);

      expect(state().idBySlug).toEqual({ "elden-ring": "game-1" });
      expect(state().loaded).toBe(true);
    });
  });
});

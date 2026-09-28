"use client";

import { Suspense, useEffect, useRef } from "react";
import { HOME_BACKGROUNDS } from "@/shared/lib/stores";
import { getHomeBackground } from "@/shared/lib/storage";
import { BackgroundImage } from "@/app/components/shared/atoms/BackgroundImage";
import { useCrossfade } from "@/shared/hooks/useCrossfade";
import { Toast, ToastContainer } from "@/app/components/shared/molecules/Toast";
import { ResultsToast } from "../molecules/ResultsToast";
import { ScrollToTop } from "@/app/components/shared/molecules/ScrollToTop";
import { Footer } from "@/app/components/shared/organisms/Footer";
import { Header } from "./Header";
import { LoginModal } from "../molecules/LoginModal";
import { useFilterStore } from "@/shared/stores/useFilterStore";
import { useSearchStore } from "@/shared/stores/useSearchStore";
import { useUIStore } from "@/shared/stores/useUIStore";
import { useFavouritesStore } from "@/shared/stores/useFavouritesStore";
import { useDisplayPrices } from "@/shared/stores/selectors";
import type { SessionUser } from "@/shared/lib/session-types";

type AppShellProps = {
  children: React.ReactNode;
  user: SessionUser | null;
  canSeeAdmin: boolean;
  googleEnabled: boolean;
};

export const AppShell = ({
  children,
  user,
  canSeeAdmin,
  googleEnabled,
}: AppShellProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const homeBgRef = useRef<string>(HOME_BACKGROUNDS[0]);

  const results = useSearchStore((s) => s.results);
  const loading = useSearchStore((s) => s.loading);
  const scraping = useSearchStore((s) => s.scraping);
  const error = useSearchStore((s) => s.error);
  const setError = useSearchStore((s) => s.setError);

  const setHeaderHeight = useUIStore((s) => s.setHeaderHeight);
  const rateLimited = useUIStore((s) => s.rateLimited);
  const setRateLimited = useUIStore((s) => s.setRateLimited);
  const triggerFilterFade = useUIStore((s) => s.triggerFilterFade);

  const selectedStores = useFilterStore((s) => s.selectedStores);
  const cheapestOnly = useFilterStore((s) => s.cheapestOnly);
  const typeFilter = useFilterStore((s) => s.typeFilter);
  const gameFilter = useFilterStore((s) => s.gameFilter);
  const currency = useFilterStore((s) => s.currency);
  const viewMode = useFilterStore((s) => s.viewMode);
  const hydrate = useFilterStore((s) => s.hydrate);

  const setFavouritesSignedIn = useFavouritesStore((s) => s.setSignedIn);
  const loadFavourites = useFavouritesStore((s) => s.load);
  const favouritesError = useFavouritesStore((s) => s.error);
  const clearFavouritesError = useFavouritesStore((s) => s.clearError);

  // The list is fetched once per sign-in, not per search: the star has to
  // already know its state when results land, or it flickers hollow first.
  useEffect(() => {
    setFavouritesSignedIn(!!user);
    if (user) void loadFavourites();
  }, [user, setFavouritesSignedIn, loadFavourites]);

  const { layers: bgLayers, setImage: setBgImage } = useCrossfade();
  const displayPrices = useDisplayPrices();

  const heroImage = results?.prices.find(
    (p) =>
      p.backgroundUrl &&
      (gameFilter === "all" ? p.gameType === "game" : p.gameName === gameFilter),
  )?.backgroundUrl;

  // Init
  useEffect(() => {
    window.scrollTo(0, 0);
    hydrate();
    useSearchStore.getState().initRates();
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      const parsed = JSON.parse(saved);
      const normalized = parsed.map(
        (s: string | { term: string; timestamp: number }) =>
          typeof s === "string" ? { term: s, timestamp: Date.now() } : s,
      );
      useSearchStore.setState({ recentSearches: normalized.slice(0, 4) });
    }
    useSearchStore.setState({ initializing: false });
    homeBgRef.current = getHomeBackground();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Header height observer
  useEffect(() => {
    const ro = new ResizeObserver(([entry]) =>
      setHeaderHeight(entry.contentRect.height),
    );
    if (headerRef.current) ro.observe(headerRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background
  useEffect(() => {
    const img = heroImage || homeBgRef.current;
    if (img) setBgImage(img);
  }, [heroImage, setBgImage]);

  // Filter fade
  useEffect(() => {
    triggerFilterFade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStores, cheapestOnly, typeFilter, gameFilter, currency, viewMode]);

  return (
    <div className="flex flex-col min-h-screen relative">
      <div className="fixed inset-0 z-0 bg-background">
        <BackgroundImage crossfade={bgLayers} opacity={0.5} />
      </div>

      <Header headerRef={headerRef} inputRef={inputRef} user={user} canSeeAdmin={canSeeAdmin} />

      {/* Once for the whole page: the header itself renders twice. */}
      <Suspense fallback={null}>
        <LoginModal googleEnabled={googleEnabled} signedIn={Boolean(user)} />
      </Suspense>

      {children}

      <ResultsToast
        scraping={scraping}
        visible={!loading && !!displayPrices && displayPrices.length > 0}
      />

      <ToastContainer position="bottom-right">
        {error && (
          <Toast variant="error" message={error} onClose={() => setError("")} />
        )}
        {favouritesError && (
          <Toast
            variant="error"
            message={favouritesError}
            onClose={clearFavouritesError}
          />
        )}
        {rateLimited && (
          <Toast
            variant="warning"
            message="Steam rate limit reached. Some data may be unavailable."
            onClose={() => setRateLimited(false)}
          />
        )}
      </ToastContainer>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

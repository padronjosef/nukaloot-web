"use client";

import { useRouter } from "next/navigation";
import { RecentSearches } from "../molecules/RecentSearches";
import { FeaturedCarousel } from "../organisms/FeaturedCarousel";
import { TopSellers } from "../organisms/TopSellers";
import { HomeSkeleton } from "../atoms/HomeSkeleton";
import { useSearchStore } from "@/shared/stores/useSearchStore";
import { useUIStore } from "@/shared/stores/useUIStore";
import { useEffect } from "react";

type FeaturedGame = {
  name: string;
  appId: number;
  image: string;
  finalPrice?: number;
  discountPercent?: number;
}

type TopSeller = {
  name: string;
  appId: number;
  image: string;
  url: string;
}

type HomeTemplateProps = {
  featuredGames: FeaturedGame[];
  topSellers: TopSeller[];
  rateLimited: boolean;
}

export const HomeTemplate = ({
  featuredGames,
  topSellers,
  rateLimited,
}: HomeTemplateProps) => {
  const router = useRouter();
  const initializing = useSearchStore((s) => s.initializing);
  const setQuery = useSearchStore((s) => s.setQuery);
  const doSearch = useSearchStore((s) => s.doSearch);
  const removeRecentSearch = useSearchStore((s) => s.removeRecentSearch);
  const setRateLimited = useUIStore((s) => s.setRateLimited);

  useEffect(() => {
    if (rateLimited) setRateLimited(true);
    if (topSellers.length > 0) {
      useUIStore.setState({
        placeholderGame: topSellers[0].name,
        topSellerNames: topSellers.slice(0, 5).map((g) => g.name),
      });
    }
  }, [rateLimited, setRateLimited, topSellers]);

  const handleSelect = (name: string) => {
    setQuery(name);
    doSearch(name);
    router.push(`/search?q=${encodeURIComponent(name)}`);
  };

  if (initializing) return <HomeSkeleton />;

  return (
    <div className="animate-fade-in-up">
      <RecentSearches
        onSelect={handleSelect}
        onRemove={removeRecentSearch}
      />
      <div className="w-full relative z-10">
        <FeaturedCarousel
          games={featuredGames}
          onSelect={handleSelect}
        />
      </div>
      <TopSellers
        games={topSellers}
        onSelect={handleSelect}
      />
    </div>
  );
};

"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { RecentSearches } from "../molecules/RecentSearches";
import { useSearchStore } from "../../../stores/useSearchStore";
import { useFilterStore } from "../../../stores/useFilterStore";
import { useUIStore } from "../../../stores/useUIStore";

const FeaturedCarousel = dynamic(() =>
  import("../organisms/FeaturedCarousel").then((m) => ({ default: m.FeaturedCarousel })),
);
const UpcomingGames = dynamic(() =>
  import("../organisms/UpcomingGames").then((m) => ({ default: m.UpcomingGames })),
);

export const HomeTemplate = () => {
  const router = useRouter();
  const recentSearches = useSearchStore((s) => s.recentSearches);
  const removeRecentSearch = useSearchStore((s) => s.removeRecentSearch);
  const setQuery = useSearchStore((s) => s.setQuery);
  const doSearch = useSearchStore((s) => s.doSearch);
  const viewMode = useFilterStore((s) => s.viewMode);
  const setRateLimited = useUIStore((s) => s.setRateLimited);

  const handleSelect = (name: string) => {
    setQuery(name);
    doSearch(name);
    router.push(`/search?q=${encodeURIComponent(name)}`);
  };

  return (
    <div className="animate-fade-in-up">
      <RecentSearches
        searches={recentSearches}
        onSelect={handleSelect}
        onRemove={removeRecentSearch}
      />
      <div className="w-full relative z-10">
        <FeaturedCarousel
          onSelect={handleSelect}
          onRateLimited={() => setRateLimited(true)}
        />
      </div>
      <UpcomingGames
        onRateLimited={() => setRateLimited(true)}
        viewMode={viewMode}
      />
    </div>
  );
};

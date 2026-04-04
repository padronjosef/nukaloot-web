"use client";

import { CloseButton } from "@/app/components/shared/atoms/CloseButton";
import { RecentSearchesSkeleton } from "./RecentSearchesSkeleton";
import { useSearchStore } from "@/app/stores/useSearchStore";

type RecentSearchesProps = {
  onSelect: (term: string) => void;
  onRemove: (term: string) => void;
};

export const RecentSearches = ({
  onSelect,
  onRemove,
}: RecentSearchesProps) => {
  const searches = useSearchStore((s) => s.recentSearches);
  const initializing = useSearchStore((s) => s.initializing);

  if (initializing) return <RecentSearchesSkeleton />;
  if (searches.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-6 relative z-10">
      <h2 className="text-lg font-bold text-white mb-3">
        <span className="bg-black/70 px-2 py-1 rounded">Recent Searches</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {searches.map((term) => (
          <div
            key={term}
            onClick={() => onSelect(term)}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700/50 rounded-lg group hover:border-zinc-600 transition-colors cursor-pointer"
          >
            <span className="flex-1 text-left text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
              {term}
            </span>

            <div onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={() => onRemove(term)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

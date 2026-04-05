"use client";

import { History } from "lucide-react";
import { RecentSearchesSkeleton } from "./RecentSearchesSkeleton";
import { useSearchStore } from "@/shared/stores/useSearchStore";

type RecentSearchesProps = {
  onSelect: (term: string) => void;
  onRemove: (term: string) => void;
};

const timeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return "Last week";
};

export const RecentSearches = ({
  onSelect,
}: RecentSearchesProps) => {
  const searches = useSearchStore((s) => s.recentSearches);
  const initializing = useSearchStore((s) => s.initializing);

  if (initializing) return <RecentSearchesSkeleton />;
  if (searches.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-6 mt-4 md:mt-0 relative z-10">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-foreground">Recent Searches</h2>
        <p className="text-sm text-muted-foreground mt-1">Pick up where you left off.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {searches.slice(0, 4).map((s) => (
          <div
            key={s.term}
            onClick={() => onSelect(s.term)}
            className="flex items-center gap-3 p-3 bg-background/90 border border-border/50 rounded-lg hover:border-border transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
              <History className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{s.term}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(s.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

"use client";

import { useRef, useMemo } from "react";
import { SearchInput } from "@/shared/UI/SearchInput";
import { MultiSelect } from "@/shared/UI/MultiSelect";
import { useUIStore } from "@/shared/stores/useUIStore";
import { History, TrendingUp, ArrowUpRight } from "lucide-react";

type SearchFormProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  onSelectRecent: (term: string) => void;
  loading: boolean;
  inputFocused: boolean;
  onFocusChange: (focused: boolean) => void;
  recentSearches: { term: string; timestamp: number }[];
  showRecent: boolean;
  onShowRecentChange: (show: boolean) => void;
  lastSearched?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  variant?: "desktop" | "mobile";
  className?: string;
  selectedTypes?: string[];
  onTypesChange?: (types: string[]) => void;
}

type Suggestion = {
  term: string;
  type: "recent" | "trending";
};

export const SearchForm = ({
  query,
  onQueryChange,
  onSubmit,
  onClear,
  onSelectRecent,
  loading,
  onFocusChange,
  recentSearches,
  showRecent,
  onShowRecentChange,
  inputRef: externalRef,
  variant = "desktop",
  className = "",
  selectedTypes,
  onTypesChange,
}: SearchFormProps) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const ref = externalRef || internalRef;
  const isDesktop = variant === "desktop";
  const topSellerNames = useUIStore((s) => s.topSellerNames);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "game", label: "Base Game" },
    { value: "bundle", label: "Bundle" },
    { value: "dlc", label: "DLC" },
    { value: "other", label: "Other" },
  ];

  const suggestions = useMemo((): Suggestion[] => {
    const items: Suggestion[] = [];
    const seen = new Set<string>();

    // User searches first
    for (const s of recentSearches) {
      const key = s.term.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ term: s.term, type: "recent" });
      }
    }

    // Fill remaining with top sellers
    for (const name of topSellerNames) {
      if (items.length >= 7) break;
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ term: name, type: "trending" });
      }
    }

    return items.slice(0, 7);
  }, [recentSearches, topSellerNames]);

  const hasSuggestions = suggestions.length > 0;

  const handleSubmit = () => {
    ref.current?.blur();
    onSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className={className}>
      <SearchInput
        ref={ref}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={() => {
          onFocusChange(true);
          if (hasSuggestions) onShowRecentChange(true);
        }}
        onBlur={() => {
          onFocusChange(false);
          setTimeout(() => onShowRecentChange(false), 200);
        }}
        disabled={loading}
        onClear={query ? onClear : undefined}
        onSubmit={handleSubmit}
        placeholder={
          loading
            ? "Searching..."
            : isDesktop
              ? "What are you looting today?"
              : "Hunt for loot"
        }
        endSlot={
          <MultiSelect
            options={categories.filter((c) => c.value !== "all")}
            selected={selectedTypes ?? []}
            onChange={onTypesChange ?? (() => {})}
            allLabel="All Categories"
            triggerClassName="border-none! h-10!"
          />
        }
        className={`${isDesktop ? "h-10 text-sm" : "h-11 text-sm"} ${loading ? "animate-pulse opacity-60" : ""}`}
        expandOpen={showRecent && hasSuggestions}
        expandContent={
          <div onMouseDown={(e) => e.preventDefault()}>
            {suggestions.map((s) => (
              <button
                key={`${s.type}-${s.term}`}
                type="button"
                onClick={() => {
                  onQueryChange(s.term);
                  onShowRecentChange(false);
                  ref.current?.blur();
                  onSelectRecent(s.term);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/80 hover:bg-border cursor-pointer"
              >
                {s.type === "recent" ? (
                  <History className="size-4 text-muted-foreground shrink-0" />
                ) : (
                  <TrendingUp className="size-4 text-muted-foreground shrink-0" />
                )}
                <span className="flex-1 text-left truncate">{s.term}</span>
                <ArrowUpRight className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        }
      />
    </div>
  );
};

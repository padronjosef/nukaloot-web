"use client";

import { useRef } from "react";
import { CloseButton } from "../../shared/atoms/CloseButton";

type SearchFormProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  onSelectRecent: (term: string) => void;
  loading: boolean;
  inputFocused: boolean;
  onFocusChange: (focused: boolean) => void;
  recentSearches: string[];
  showRecent: boolean;
  onShowRecentChange: (show: boolean) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  variant?: "desktop" | "mobile";
  className?: string;
}

export const SearchForm = ({
  query,
  onQueryChange,
  onSubmit,
  onClear,
  onSelectRecent,
  loading,
  inputFocused,
  onFocusChange,
  recentSearches,
  showRecent,
  onShowRecentChange,
  inputRef: externalRef,
  variant = "desktop",
  className = "",
}: SearchFormProps) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const ref = externalRef || internalRef;
  const isDesktop = variant === "desktop";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        ref.current?.blur();
        onSubmit(e);
      }}
      className={className}
    >
      <div className="flex items-stretch">
        <div
          className={`relative flex-1 transition-all duration-300 ${!isDesktop ? "min-w-0" : ""}`}
        >
          <input
            ref={ref}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => {
              onFocusChange(true);
              recentSearches.length > 0 && onShowRecentChange(true);
            }}
            onBlur={() => {
              onFocusChange(false);
              setTimeout(() => onShowRecentChange(false), 200);
            }}
            disabled={loading}
            placeholder={
              loading
                ? "Searching..."
                : isDesktop
                  ? "Search for a game... (e.g. Elden Ring)"
                  : "Search for a game..."
            }
            className={`w-full ${isDesktop ? "h-12 px-4 pr-14" : "h-11 px-4 pr-13 text-sm"} rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${loading ? "animate-pulse opacity-60" : ""}`}
          />
          {query && (
            <CloseButton
              onClick={onClear}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            />
          )}
          {showRecent && recentSearches.length > 0 && (
            <div
              className="absolute left-0 right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-100 py-1"
              onMouseDown={(e) => e.preventDefault()}
            >
              <p className="px-3 py-1 text-xs text-zinc-500">Recent searches</p>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    onQueryChange(term);
                    onShowRecentChange(false);
                    ref.current?.blur();
                    onSelectRecent(term);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className={`${isDesktop ? "h-12" : "h-11"} rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:brightness-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-all duration-300 overflow-hidden ${
            inputFocused && query.trim().length >= 2 && !loading
              ? `${isDesktop ? "w-12" : "w-11"} ml-2 opacity-100`
              : "w-0 ml-0 opacity-0"
          }`}
        >
          {loading ? (
            <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

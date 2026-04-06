"use client";

import { useRouter } from "next/navigation";
import { SearchForm } from "../molecules/SearchForm";
import { ViewToggle } from "../atoms/ViewToggle";
import { Radiation } from "lucide-react";
import { useFilterStore } from "@/shared/stores/useFilterStore";
import { useSearchStore } from "@/shared/stores/useSearchStore";
import { useUIStore } from "@/shared/stores/useUIStore";
import pkg from "../../../../../package.json";

type HeaderProps = {
  headerRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export const Header = ({ headerRef, inputRef }: HeaderProps) => {
  const router = useRouter();

  const selectedTypes = useFilterStore((s) => s.selectedTypes);
  const setSelectedTypes = useFilterStore((s) => s.setSelectedTypes);
  const viewMode = useFilterStore((s) => s.viewMode);
  const setViewMode = useFilterStore((s) => s.setViewMode);

  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const loading = useSearchStore((s) => s.loading);
  const recentSearches = useSearchStore((s) => s.recentSearches);
  const showRecent = useSearchStore((s) => s.showRecent);
  const setShowRecent = useSearchStore((s) => s.setShowRecent);
  const doSearch = useSearchStore((s) => s.doSearch);
  const clearSearch = useSearchStore((s) => s.clearSearch);
  const lastSearched = useSearchStore((s) => s.results?.game?.name || "");

  const inputFocused = useUIStore((s) => s.inputFocused);
  const setInputFocused = useUIStore((s) => s.setInputFocused);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (term.length < 2) {
      inputRef.current?.blur();
      return;
    }
    inputRef.current?.blur();
    router.push(`/search?q=${encodeURIComponent(term)}`);
    doSearch(term);
  };

  const handleClear = () => {
    clearSearch();
    router.push("/");
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
    doSearch(term);
  };

  return (
    <>
      {/* Header */}
      <div ref={headerRef} className="z-500 flex flex-col items-center mb-6">
        {/* Desktop header */}
        <header className="hidden md:flex w-full relative z-10 bg-background">
          <div className="w-full max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
            <div
              className="shrink-0 flex flex-col cursor-pointer"
              onClick={() => {
                router.push("/");
                clearSearch();
              }}
            >
              <h1 className="text-xl font-bold italic text-primary flex items-center gap-2">
                <Radiation className="size-6 rounded-full" />
                Nukaloot
              </h1>
              <span className="text-[9px] text-muted-foreground -mt-1 ml-8">v{pkg.version}</span>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-150 min-w-0">
              <SearchForm
                query={query}
                onQueryChange={setQuery}
                onSubmit={onSubmitSearch}
                onClear={handleClear}
                onSelectRecent={handleSelectRecent}
                loading={loading}
                inputFocused={inputFocused}
                onFocusChange={setInputFocused}
                recentSearches={recentSearches}
                showRecent={showRecent}
                onShowRecentChange={setShowRecent}
                lastSearched={lastSearched}
                inputRef={inputRef}
                variant="desktop"
                className="flex-1 min-w-0"
                selectedTypes={selectedTypes}
                onTypesChange={setSelectedTypes}
              />
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </header>

        {/* Mobile */}
        <div className="md:hidden w-full flex flex-col bg-background">
          {/* Mobile header bar */}
          <div className="flex items-center justify-between px-4 pt-3 pb-4">
            <div
              className="flex flex-col cursor-pointer"
              onClick={() => {
                router.push("/");
                clearSearch();
              }}
            >
              <h1 className="text-lg font-bold italic text-primary flex items-center gap-1.5">
                <Radiation className="size-5.5 rounded-full" />
                Nukaloot
              </h1>
              <span className="text-[9px] text-muted-foreground -mt-1 ml-8">v{pkg.version}</span>
            </div>

            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>

          {/* Mobile search */}
          <div className="bg-linear-to-b from-[#1a1a1a] to-[#111111] rounded-none! px-4 pt-4 pb-10 -mb-6">
            <SearchForm
              query={query}
              onQueryChange={setQuery}
              onSubmit={onSubmitSearch}
              onClear={handleClear}
              onSelectRecent={handleSelectRecent}
              loading={loading}
              inputFocused={inputFocused}
              onFocusChange={setInputFocused}
              recentSearches={recentSearches}
              showRecent={showRecent}
              onShowRecentChange={setShowRecent}
              lastSearched={lastSearched}
              variant="mobile"
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
            />
          </div>
        </div>
      </div>
    </>
  );
};

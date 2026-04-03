"use client";

import { Collapse } from "../../shared/atoms/Collapse";
import { CheapestButton } from "../atoms/CheapestButton";
import { ViewToggle } from "../atoms/ViewToggle";
import { CurrencySelector } from "../molecules/CurrencySelector";
import { StoreSection } from "../molecules/StoreSection";
import { useFilterStore } from "../../../stores/useFilterStore";
import { useSearchStore } from "../../../stores/useSearchStore";
import { useUIStore } from "../../../stores/useUIStore";

export const MobileMenu = () => {
  const cheapestOnly = useFilterStore((s) => s.cheapestOnly);
  const setCheapestOnly = useFilterStore((s) => s.setCheapestOnly);
  const viewMode = useFilterStore((s) => s.viewMode);
  const setViewMode = useFilterStore((s) => s.setViewMode);
  const currency = useFilterStore((s) => s.currency);
  const setCurrency = useFilterStore((s) => s.setCurrency);

  const rates = useSearchStore((s) => s.rates);

  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <Collapse
      open={mobileMenuOpen}
      maxHeight="70vh"
      duration={200}
      className="absolute left-0 right-0 top-full mt-1 z-400"
    >
      <div
        className="bg-zinc-800 border border-zinc-600/50 rounded-lg px-4 py-4 flex flex-col gap-4 shadow-2xl max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <CheapestButton
            active={cheapestOnly}
            onClick={() => {
              setCheapestOnly(!cheapestOnly);
              closeMenu();
            }}
          />
          <ViewToggle
            value={viewMode}
            onChange={(m) => {
              setViewMode(m);
              closeMenu();
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            Currency
          </span>
          <CurrencySelector
            value={currency}
            onChange={(c) => {
              setCurrency(c);
              closeMenu();
            }}
            availableRates={rates}
          />
        </div>

        <hr className="border-zinc-600" />

        <StoreSection />
      </div>
    </Collapse>
  );
};

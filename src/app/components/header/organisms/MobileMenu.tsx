"use client";

import Image from "next/image";
import { Collapse } from "../../shared/atoms/Collapse";
import { Expandable } from "../../shared/atoms/Expandable";
import { Checkbox } from "../../shared/atoms/Checkbox";
import { StoreIcon } from "../../shared/atoms/StoreIcon";
import { CheapestButton } from "../atoms/CheapestButton";
import { ViewToggle } from "../atoms/ViewToggle";
import { GLOBAL_CURRENCIES, LATAM_CURRENCIES, getCountryForCurrency } from "../../../lib/currency";
import { MAIN_STORES, STORE_ICONS } from "../../../lib/stores";
import type { CurrencyCode } from "../../../lib/stores/types";
import { useFilterStore, selectAllStoresSelected, selectAllStoreNames } from "../../../stores/useFilterStore";
import { useSearchStore } from "../../../stores/useSearchStore";
import { useUIStore } from "../../../stores/useUIStore";

const FlagIcon = ({ country }: { country: string }) => (
  <Image
    src={`https://flagcdn.com/${country}.svg`}
    alt={country}
    width={20}
    height={15}
    className="inline-block rounded-sm object-cover"
    style={{ width: 20, height: 15 }}
  />
);

export const MobileMenu = () => {
  const cheapestOnly = useFilterStore((s) => s.cheapestOnly);
  const setCheapestOnly = useFilterStore((s) => s.setCheapestOnly);
  const viewMode = useFilterStore((s) => s.viewMode);
  const setViewMode = useFilterStore((s) => s.setViewMode);
  const currency = useFilterStore((s) => s.currency);
  const setCurrency = useFilterStore((s) => s.setCurrency);
  const selectedStores = useFilterStore((s) => s.selectedStores);
  const noneSelected = useFilterStore((s) => s.noneSelected);
  const allStoresSelected = useFilterStore(selectAllStoresSelected);
  const toggleStore = useFilterStore((s) => s.toggleStore);
  const toggleAllStores = useFilterStore((s) => s.toggleAllStores);
  const toggleGroup = useFilterStore((s) => s.toggleGroup);
  const allStoreNames = selectAllStoreNames();

  const rates = useSearchStore((s) => s.rates);
  const results = useSearchStore((s) => s.results);

  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);

  const closeMenu = () => setMobileMenuOpen(false);

  const storesWithResults = new Set(
    results
      ? results.prices.map((p) => p.store?.name || p.storeName || "").filter(Boolean)
      : [],
  );

  const currentSet = noneSelected
    ? new Set<string>()
    : selectedStores.size === 0
      ? new Set(allStoreNames)
      : selectedStores;

  const mainStores = allStoreNames.filter((s) => MAIN_STORES.has(s));
  const otherStores = allStoreNames.filter((s) => !MAIN_STORES.has(s));

  const handleCurrency = (code: CurrencyCode) => {
    setCurrency(code);
    closeMenu();
  };

  const renderCurrencyItem = (c: { code: string; name: string; symbol: string; country: string }) => {
    const available = c.code === "USD" || c.code in rates;
    return (
      <button
        key={c.code}
        type="button"
        disabled={!available}
        onClick={() => available && handleCurrency(c.code as CurrencyCode)}
        className={`px-3 py-1.5 rounded text-sm font-mono flex items-center gap-1.5 ${
          !available
            ? "text-zinc-600 cursor-not-allowed brightness-50"
            : currency === c.code
              ? "bg-zinc-700 text-white"
              : "text-zinc-300 hover:bg-zinc-700 cursor-pointer"
        }`}
      >
        <FlagIcon country={c.country} />
        {c.code}
      </button>
    );
  };

  const renderStoreItem = (store: string) => {
    const storeHasResults = storesWithResults.has(store);
    const unavailable = !!results && !storeHasResults;
    const isSelected = allStoresSelected || (!noneSelected && selectedStores.has(store));
    return (
      <div
        key={store}
        onClick={() => toggleStore(store)}
        className={`flex items-center gap-3 px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-700 rounded ${unavailable ? "brightness-50" : ""}`}
      >
        <Checkbox checked={isSelected} />
        <StoreIcon storeName={store} />
        <span className={`truncate ${unavailable ? "text-zinc-500" : "text-white"}`}>
          {store}
        </span>
      </div>
    );
  };

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

        <Expandable
          id="currency"
          title="Currency"
          rightSlot={
            <div className="flex items-center gap-2 text-sm">
              <FlagIcon country={getCountryForCurrency(currency)} />
              <span className="font-bold text-white">{currency}</span>
            </div>
          }
        >
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              {GLOBAL_CURRENCIES.map(renderCurrencyItem)}
            </div>
            <div className="w-px bg-zinc-700" />
            <div className="flex-1 flex flex-col gap-1">
              {LATAM_CURRENCIES.map(renderCurrencyItem)}
            </div>
          </div>
        </Expandable>

        <div className="flex items-center gap-2">
          <hr className="flex-1 border-zinc-600" />
          <span className="text-[10px] text-zinc-500">
            v{process.env.NEXT_PUBLIC_APP_VERSION}
          </span>
          <hr className="flex-1 border-zinc-600" />
        </div>

        <Expandable
          id="main-stores"
          title="Main Stores"
          defaultOpen
          leftSlot={<Checkbox checked={mainStores.every((s) => currentSet.has(s))} />}
          onLeftSlotClick={() => toggleGroup(mainStores)}
        >
          {mainStores.map(renderStoreItem)}
        </Expandable>

        <Expandable
          id="other-stores"
          title="Other Stores"
          leftSlot={<Checkbox checked={otherStores.every((s) => currentSet.has(s))} />}
          onLeftSlotClick={() => toggleGroup(otherStores)}
        >
          {otherStores.map(renderStoreItem)}
        </Expandable>
      </div>
    </Collapse>
  );
};

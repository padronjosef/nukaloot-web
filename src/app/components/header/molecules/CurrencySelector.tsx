"use client";

import { useState } from "react";
import Image from "next/image";
import { Dropdown, useDropdownClose } from "@/app/components/shared/atoms/Dropdown";
import { GLOBAL_CURRENCIES, LATAM_CURRENCIES, getCountryForCurrency } from "@/app/lib/currency";
import type { CurrencyCode } from "@/app/lib/stores/types";

type CurrencySelectorProps = {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  availableRates: Record<string, number>;
};

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


type CurrencyButtonProps = {
  currency: (typeof GLOBAL_CURRENCIES)[number] | (typeof LATAM_CURRENCIES)[number];
  value: CurrencyCode;
  availableRates: Record<string, number>;
  onChange: (code: CurrencyCode) => void;
  hoveredCode: string | null;
  onHover: (code: string | null) => void;
};

const CurrencyButton = ({
  currency,
  value,
  availableRates,
  onChange,
  hoveredCode,
  onHover,
}: CurrencyButtonProps) => {
  const close = useDropdownClose();
  const available = currency.code === "USD" || currency.code in availableRates;
  return (
    <div className="relative">
      <button
        type="button"
        disabled={!available}
        onClick={() => {
          if (!available) return;
          onChange(currency.code);
          close?.();
        }}
        onMouseEnter={() => onHover(currency.code)}
        onMouseLeave={() => onHover(null)}
        className={`w-full text-left px-4 py-2 text-sm font-mono transition-colors flex items-center gap-2 ${
          !available
            ? "text-zinc-600 cursor-not-allowed brightness-50"
            : value === currency.code
              ? "bg-blue-600/30 text-blue-300"
              : "text-zinc-300 hover:bg-zinc-700"
        }`}
      >
        <FlagIcon country={currency.country} />
        {currency.code}
      </button>

      {hoveredCode === currency.code && (
        <div className="hidden md:block absolute right-full top-0 mr-2 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-xs text-zinc-300 whitespace-nowrap shadow-lg">
          {available ? currency.name : `${currency.name} (not available)`}
        </div>
      )}
    </div>
  );
};

export const CurrencySelector = ({
  value,
  onChange,
  availableRates,
}: CurrencySelectorProps) => {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  return (
    <Dropdown
      trigger={
        <>
          <FlagIcon country={getCountryForCurrency(value)} />
          {value}
        </>
      }
      panelClassName="min-w-54 py-2 grid grid-cols-2 gap-x-1"
    >
      <div>
        <div className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
          Global
        </div>
        {GLOBAL_CURRENCIES.map((c) => (
          <CurrencyButton
            key={c.code}
            currency={c}
            value={value}
            availableRates={availableRates}
            onChange={onChange}
            hoveredCode={hoveredCode}
            onHover={setHoveredCode}
          />
        ))}
      </div>
      <div className="border-l border-zinc-700">
        <div className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
          Latam
        </div>
        {LATAM_CURRENCIES.map((c) => (
          <CurrencyButton
            key={c.code}
            currency={c}
            value={value}
            availableRates={availableRates}
            onChange={onChange}
            hoveredCode={hoveredCode}
            onHover={setHoveredCode}
          />
        ))}
      </div>
    </Dropdown>
  );
};

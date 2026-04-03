"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const CURRENCIES = [
  { code: "USD", name: "United States Dollar", symbol: "$", country: "us" },
  { code: "EUR", name: "Euro", symbol: "€", country: "eu" },
  { code: "COP", name: "Colombian Peso", symbol: "$", country: "co" },
  { code: "GBP", name: "British Pound Sterling", symbol: "£", country: "gb" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", country: "br" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", country: "mx" },
  { code: "ARS", name: "Argentine Peso", symbol: "$", country: "ar" },
  { code: "CLP", name: "Chilean Peso", symbol: "$", country: "cl" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/", country: "pe" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", country: "jp" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", country: "ca" },
  { code: "AUD", name: "Australian Dollar", symbol: "$", country: "au" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  availableRates: Record<string, number>;
}

function FlagIcon({ country }: { country: string }) {
  return (
    <Image
      src={`https://flagcdn.com/${country}.svg`}
      alt={country}
      width={20}
      height={15}
      className="inline-block rounded-sm object-cover"
      style={{ width: 20, height: 15 }}
    />
  );
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol || "$";
}

export function getCountryForCurrency(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.country || "us";
}

function getCountry(code: string): string {
  return getCountryForCurrency(code);
}

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD", EU: "EUR", CO: "COP", GB: "GBP", BR: "BRL",
  MX: "MXN", AR: "ARS", CL: "CLP", PE: "PEN", JP: "JPY",
  CA: "CAD", AU: "AUD",
  // Common EU countries → EUR
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", PT: "EUR", BE: "EUR", AT: "EUR", IE: "EUR", FI: "EUR",
};

export async function detectUserCurrency(): Promise<CurrencyCode | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const country = data.country_code?.toUpperCase();
    return COUNTRY_TO_CURRENCY[country] || null;
  } catch {
    return null;
  }
}

const GLOBAL_CURRENCIES = new Set(["USD", "EUR", "GBP", "CAD", "AUD", "JPY"]);

function renderCurrencyButton(
  currency: typeof CURRENCIES[number],
  value: CurrencyCode,
  availableRates: Record<string, number>,
  onChange: (code: CurrencyCode) => void,
  setOpen: (open: boolean) => void,
  hoveredCode: string | null,
  setHoveredCode: (code: string | null) => void,
) {
  const available = currency.code === "USD" || currency.code in availableRates;
  return (
    <div key={currency.code} className="relative">
      <button
        type="button"
        disabled={!available}
        onClick={() => {
          if (!available) return;
          onChange(currency.code);
          setOpen(false);
        }}
        onMouseEnter={() => setHoveredCode(currency.code)}
        onMouseLeave={() => setHoveredCode(null)}
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
}

export function CurrencySelector({ value, onChange, availableRates }: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer bg-zinc-800 border border-zinc-600/50 text-zinc-400 hover:text-zinc-200"
      >
        <FlagIcon country={getCountry(value)} />
        {value}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={open ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"} />
        </svg>
      </button>

      <div className={`absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-[100] min-w-[360px] py-2 grid grid-cols-2 gap-x-1 transition-all duration-200 origin-top ${
        open ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-0 pointer-events-none"
      }`}>
          <div>
            <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Global</div>
            {CURRENCIES.filter(c => GLOBAL_CURRENCIES.has(c.code)).map((currency) => renderCurrencyButton(currency, value, availableRates, onChange, setOpen, hoveredCode, setHoveredCode))}
          </div>
          <div>
            <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Latam</div>
            {CURRENCIES.filter(c => !GLOBAL_CURRENCIES.has(c.code)).map((currency) => renderCurrencyButton(currency, value, availableRates, onChange, setOpen, hoveredCode, setHoveredCode))}
          </div>
        </div>
    </div>
  );
}

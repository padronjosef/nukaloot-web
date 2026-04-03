import type { CurrencyCode } from "./stores/types";
import type { ViewMode } from "./stores";
import { HOME_BACKGROUNDS } from "./stores";

export const getStoredCurrency = (): CurrencyCode => {
  if (typeof window === "undefined") return "USD";
  return (localStorage.getItem("currency") as CurrencyCode) || "USD";
};

export const getStoredViewMode = (): ViewMode => {
  if (typeof window === "undefined") return "grid";
  return (localStorage.getItem("view_mode") as ViewMode) || "grid";
};


export const getStoredCheapestOnly = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cheapest_only") === "true";
};

export const getHomeBackground = (): string => {
  if (typeof window === "undefined") return HOME_BACKGROUNDS[0];
  const stored = sessionStorage.getItem("home_background");
  if (stored) return stored;
  const picked = HOME_BACKGROUNDS[Math.floor(Math.random() * HOME_BACKGROUNDS.length)];
  sessionStorage.setItem("home_background", picked);
  return picked;
};

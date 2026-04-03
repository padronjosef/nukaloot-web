"use client";

import { create } from "zustand";

type UIState = {
  mobileMenuOpen: boolean;
  inputFocused: boolean;
  headerHeight: number;
  rateLimited: boolean;
  filterFade: boolean;
}

let filterFadeTimer: ReturnType<typeof setTimeout> | undefined;

type UIActions = {
  setMobileMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setInputFocused: (focused: boolean) => void;
  setHeaderHeight: (height: number) => void;
  setRateLimited: (limited: boolean) => void;
  triggerFilterFade: () => void;
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  // State
  mobileMenuOpen: false,
  inputFocused: false,
  headerHeight: 0,
  rateLimited: false,
  filterFade: false,

  // Actions
  setMobileMenuOpen: (value) => {
    set((state) => {
      const open =
        typeof value === "function" ? value(state.mobileMenuOpen) : value;
      document.body.style.overflow = open ? "hidden" : "";
      return { mobileMenuOpen: open };
    });
  },

  setInputFocused: (inputFocused) => set({ inputFocused }),

  setHeaderHeight: (headerHeight) => set({ headerHeight }),

  setRateLimited: (rateLimited) => set({ rateLimited }),

  triggerFilterFade: () => {
    set({ filterFade: true });
    clearTimeout(filterFadeTimer);
    filterFadeTimer = setTimeout(() => set({ filterFade: false }), 400);
  },
}));

"use client";

import { create } from "zustand";

type UIState = {
  mobileMenuOpen: boolean;
  inputFocused: boolean;
  headerHeight: number;
  rateLimited: boolean;
  filterFade: boolean;
  toastVisible: boolean;
  placeholderGame: string;
  topSellerNames: string[];
  /**
   * Lives here because the header renders twice — desktop and mobile — and
   * there must only ever be one sign-in dialog in the page.
   */
  signInOpen: boolean;
}

let filterFadeTimer: ReturnType<typeof setTimeout> | undefined;

type UIActions = {
  setMobileMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setInputFocused: (focused: boolean) => void;
  setHeaderHeight: (height: number) => void;
  setRateLimited: (limited: boolean) => void;
  triggerFilterFade: () => void;
  setSignInOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  // State
  mobileMenuOpen: false,
  inputFocused: false,
  headerHeight: 0,
  rateLimited: false,
  filterFade: false,
  toastVisible: false,
  placeholderGame: "",
  topSellerNames: [],
  signInOpen: false,

  // Actions
  setMobileMenuOpen: (value) => {
    set((state) => {
      const open =
        typeof value === "function" ? value(state.mobileMenuOpen) : value;
      if (!open) window.scrollTo({ top: 0, behavior: "smooth" });
      return { mobileMenuOpen: open };
    });
  },

  setInputFocused: (inputFocused) => set({ inputFocused }),

  setHeaderHeight: (headerHeight) => set({ headerHeight }),

  setRateLimited: (rateLimited) => set({ rateLimited }),

  setSignInOpen: (signInOpen) => set({ signInOpen }),

  triggerFilterFade: () => {
    set({ filterFade: true });
    clearTimeout(filterFadeTimer);
    filterFadeTimer = setTimeout(() => set({ filterFade: false }), 400);
  },
}));

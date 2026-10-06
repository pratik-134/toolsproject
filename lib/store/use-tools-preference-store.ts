"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ToolsPreferenceState {
  recentSlugs: string[];
  favoriteSlugs: string[];
  addRecent: (slug: string) => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  clearRecents: () => void;
}

export const useToolsPreferenceStore = create<ToolsPreferenceState>()(
  persist(
    (set, get) => ({
      recentSlugs: [],
      favoriteSlugs: [],

      addRecent: (slug: string) => {
        if (!slug) return;
        set((state) => {
          const filtered = state.recentSlugs.filter((s) => s !== slug);
          return {
            recentSlugs: [slug, ...filtered].slice(0, 8),
          };
        });
      },

      toggleFavorite: (slug: string) => {
        if (!slug) return;
        set((state) => {
          const exists = state.favoriteSlugs.includes(slug);
          return {
            favoriteSlugs: exists
              ? state.favoriteSlugs.filter((s) => s !== slug)
              : [...state.favoriteSlugs, slug],
          };
        });
      },

      isFavorite: (slug: string) => {
        return get().favoriteSlugs.includes(slug);
      },

      clearRecents: () => {
        set({ recentSlugs: [] });
      },
    }),
    {
      name: "qwertygen_tools_preferences",
    }
  )
);

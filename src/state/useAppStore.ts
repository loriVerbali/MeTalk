import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState, Avatar, Lang, Category } from "../types";

interface AppStore extends AppState {
  // Actions
  setAvatar: (avatar: Avatar | null) => void;
  setLanguage: (language: Lang) => void;
  setHighContrast: (highContrast: boolean) => void;
  setCurrentCategory: (category: Category["key"] | null) => void;
  incrementAvatarsCreated: () => void;
  reset: () => void;
}

const initialState: AppState = {
  avatar: null,
  language: "en",
  highContrast: false,
  avatarsCreated: 0,
  currentCategory: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAvatar: (avatar) => set({ avatar }),

      setLanguage: (language) => set({ language }),

      setHighContrast: (highContrast) => {
        set({ highContrast });
        // Apply high contrast class to document (only if document is available)
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute(
            "data-high-contrast",
            highContrast.toString()
          );
        }
      },

      setCurrentCategory: (currentCategory) => set({ currentCategory }),

      incrementAvatarsCreated: () => {
        const current = get().avatarsCreated;
        const newCount = current + 1;
        set({ avatarsCreated: newCount });
      },

      reset: () => {
        set(initialState);
        if (typeof document !== "undefined") {
          document.documentElement.removeAttribute("data-high-contrast");
        }
      },
    }),
    {
      name: "metalk-session",
      // Only persist certain values, not the avatar blob
      partialize: (state) => ({
        language: state.language,
        highContrast: state.highContrast,
        avatarsCreated: state.avatarsCreated,
      }),
    }
  )
);

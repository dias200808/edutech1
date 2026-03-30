"use client";

import { create } from "zustand";

type AppStore = {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  selectedChildId: string | null;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setSelectedChildId: (id: string | null) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  sidebarCollapsed: false,
  mobileNavOpen: false,
  selectedChildId: null,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setSelectedChildId: (id) => set({ selectedChildId: id }),
}));

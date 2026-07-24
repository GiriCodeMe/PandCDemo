import { create } from 'zustand';

interface UiState {
  searchOpen: boolean;
  sidebarOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  searchOpen: false,
  sidebarOpen: true,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

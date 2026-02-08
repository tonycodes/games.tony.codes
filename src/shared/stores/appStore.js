import { create } from 'zustand';

export const useAppStore = create((set) => ({
  isMuted: false,
  currentGame: null,
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setCurrentGame: (game) => set({ currentGame: game }),
}));

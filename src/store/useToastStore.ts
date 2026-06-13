import { create } from "zustand";

interface ToastState {
  message: string | null;
  stamp: number;
  show: (message: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  stamp: 0,
  show: (message) => set({ message, stamp: Date.now() }),
}));

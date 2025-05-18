import { create } from "zustand";

type LoadingStore = {
  loading: boolean;
  setLoading: (val: boolean) => void;
  resetLoading: () => void;
};

export const useLoadingStore = create<LoadingStore>((set) => ({
  loading: false,
  setLoading: (val) => set({ loading: val }),
  resetLoading: () => set({ loading: false }),
}));

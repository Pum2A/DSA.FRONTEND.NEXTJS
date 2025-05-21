import { create } from "zustand";

type DemoStore = {
  isDemo: boolean;
  setDemo: (isDemo: boolean) => void;
};

export const useDemoStore = create<DemoStore>((set) => ({
  isDemo: false,
  setDemo: (isDemo) => set({ isDemo }),
}));

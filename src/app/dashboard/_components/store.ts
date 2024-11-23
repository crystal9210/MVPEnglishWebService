// app/dashboard/_components/store.ts

import create from "zustand";

type Store = {
    darkMode: boolean;
    toggleDarkMode: () => void;
};

export const useStore = create<Store>((set) => ({
    darkMode: false,
    toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));

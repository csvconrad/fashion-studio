import { create } from 'zustand';

export type UIMode = 'kid' | 'advanced';

interface SettingsStore {
  mode: UIMode;
  setMode: (mode: UIMode) => void;
  toggleMode: () => void;
}

const STORAGE_KEY = 'fashion-studio-ui-mode';
const stored = (typeof localStorage !== 'undefined'
  ? localStorage.getItem(STORAGE_KEY)
  : null) as UIMode | null;

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  mode: stored ?? 'kid',

  setMode: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    set({ mode });
  },

  toggleMode: () => {
    const next = get().mode === 'kid' ? 'advanced' : 'kid';
    localStorage.setItem(STORAGE_KEY, next);
    set({ mode: next });
  },
}));

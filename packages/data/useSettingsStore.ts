import { create } from 'zustand';
import { getAllSettings } from '@actions/settings';
import type { FlatSettings, SettingKey } from '@actions/settings/types';

interface SettingsState {
  settings: FlatSettings;
  isLoading: boolean;
  error: Error | null;
  initialized: boolean;
  fetchSettings: () => Promise<void>;
  getSetting: (key: SettingKey) => string | null;
  getSettingWithDefault: (key: SettingKey, defaultValue: string) => string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  isLoading: false,
  error: null,
  initialized: false,
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await getAllSettings();
      set({ settings, isLoading: false, initialized: true });
    } catch (error) {
      set({ error: error instanceof Error ? error : new Error(String(error)), isLoading: false });
      console.error("Failed to fetch settings:", error);
    }
  },
  getSetting: (key: SettingKey) => {
    const state = get();
    return state.settings[key] || null;
  },
  getSettingWithDefault: (key: SettingKey, defaultValue: string) => {
    const state = get();
    return state.settings[key] || defaultValue;
  },
}));

// Optionally, fetch settings when the store is initialized
// useSettingsStore.getState().fetchSettings();

import { create } from 'zustand';
import { cachedGetAllSettings } from '@actions/settings';
import type { FlatSettings, SettingKey } from '@actions/settings/types';
import { getDefaultSetting } from '@actions/settings/types';

interface SettingsState {
  settings: FlatSettings;
  isLoading: boolean;
  error: Error | null;
  initialized: boolean;
  fetchSettings: () => Promise<void>;
  getSetting: (key: SettingKey) => string | null;
  getSettingWithDefault: (key: SettingKey, fallbackValue?: string) => string;
  invalidateCache: () => void;
  refresh: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  isLoading: false,
  error: null,
  initialized: false,
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await cachedGetAllSettings();
      set({ settings, isLoading: false, initialized: true });
    } catch (error) {
      set({ error: error instanceof Error ? error : new Error(String(error)), isLoading: false });
      console.error("Failed to fetch settings:", error);
    }
  },
  getSetting: (key: SettingKey) => {
    const state = get();
    return state.settings[key] || getDefaultSetting(key) || null;
  },
  getSettingWithDefault: (key: SettingKey, fallbackValue?: string) => {
    const state = get();
    return state.settings[key] || getDefaultSetting(key) || fallbackValue || '';
  },
  invalidateCache: () => {
    // Reset the store and refetch settings
    set({ initialized: false, settings: {} });
    get().fetchSettings();
  },
  refresh: async () => {
    await get().fetchSettings();
  },
}));

// Optionally, fetch settings when the store is initialized
// useSettingsStore.getState().fetchSettings();

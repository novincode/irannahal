import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { cachedGetAllSettings, invalidateSettingsCache, getFreshSettings } from '@actions/settings';
import type { FlatSettings, SettingKey } from '@actions/settings/types';
import { getDefaultSetting } from '@actions/settings/types';
import { dispatchGlobalRefresh } from './globalRefresh';

interface SettingsState {
  settings: FlatSettings;
  isLoading: boolean;
  error: Error | null;
  initialized: boolean;
  lastUpdated: number;
  fetchSettings: (bypassCache?: boolean) => Promise<void>;
  getSetting: (key: SettingKey) => string | null;
  getSettingWithDefault: (key: SettingKey, fallbackValue?: string) => string;
  invalidateCache: () => Promise<void>;
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

// Global store instance tracking
let storeInstance: ReturnType<typeof createSettingsStore> | null = null;
const storeInstanceId = Math.random().toString(36).substr(2, 9);

// Create the actual store
function createSettingsStore() {
  console.log('🏪 Creating NEW settings store instance:', storeInstanceId);
  
  return create<SettingsState>()(
    subscribeWithSelector((set, get) => ({
      settings: {},
      isLoading: false,
      error: null,
      initialized: false,
      lastUpdated: 0,
      fetchSettings: async (bypassCache = false) => {
        console.log('🔄 Settings Store: Starting fetch... (Instance:', storeInstanceId, '), bypassCache:', bypassCache)
        set({ isLoading: true, error: null });
        try {
          let settings: FlatSettings;
          
          if (bypassCache) {
            // Get fresh settings directly from database, bypassing cache
            const freshSettings = await getFreshSettings();
            settings = freshSettings;
            console.log('🆕 Settings Store: Fetched fresh settings (bypassed cache):', settings);
          } else {
            // Use cached settings
            settings = await cachedGetAllSettings();
            console.log('💾 Settings Store: Fetched cached settings:', settings);
          }
          
          console.log('✅ Settings Store: Received settings (Instance:', storeInstanceId, '):', settings)
          console.log('📊 Settings count:', Object.keys(settings || {}).length)
          
          set({ 
            settings: settings || {}, 
            isLoading: false, 
            initialized: true,
            lastUpdated: Date.now()
          });
          
          // Log the final state
          const finalState = get();
          console.log('📋 Final store state (Instance:', storeInstanceId, '):', {
            initialized: finalState.initialized,
            settingsCount: Object.keys(finalState.settings).length,
            sampleSetting: finalState.settings['site.title']
          });
          
        } catch (error) {
          console.error('❌ Settings Store: Fetch failed (Instance:', storeInstanceId, '):', error)
          set({ error: error instanceof Error ? error : new Error(String(error)), isLoading: false });
        }
      },
      getSetting: (key: SettingKey) => {
        const state = get();
        const value = state.settings[key] || getDefaultSetting(key) || null;
        console.log(`🔍 getSetting(${key}):`, {
          storeInitialized: state.initialized,
          settingsCount: Object.keys(state.settings).length,
          keyExists: key in state.settings,
          value,
          defaultValue: getDefaultSetting(key)
        });
        return value;
      },
      getSettingWithDefault: (key: SettingKey, fallbackValue?: string) => {
        const state = get();
        const value = state.settings[key] || getDefaultSetting(key) || fallbackValue || '';
        console.log(`🔍 getSettingWithDefault(${key}):`, {
          storeInitialized: state.initialized,
          settingsCount: Object.keys(state.settings).length,
          keyExists: key in state.settings,
          value,
          defaultValue: getDefaultSetting(key),
          fallbackValue
        });
        return value;
      },
      invalidateCache: async () => {
        console.log('🗑️ Settings Store: Invalidating cache and refreshing...');
        // First, invalidate server-side cache
        await invalidateSettingsCache();
        // Then fetch fresh settings directly from database
        await get().fetchSettings(true); // bypassCache = true
        // Notify other components to refresh
        dispatchGlobalRefresh('settings');
      },
      refresh: async () => {
        console.log('🔄 Settings Store: Refreshing from cache...');
        // Refresh from cache (normal fetch)
        set({ isLoading: true, error: null });
        await get().fetchSettings(false); // bypassCache = false
      },
      forceRefresh: async () => {
        console.log('🔄 Settings Store: Force refreshing (bypassing cache)...');
        // Complete refresh - get fresh data from database
        set({ initialized: false, settings: {}, error: null, isLoading: true, lastUpdated: 0 });
        await get().fetchSettings(true); // bypassCache = true
        // Notify other components to refresh
        dispatchGlobalRefresh('settings');
      },
    }))
  );
}

// Singleton pattern - ensure only one store instance
export const useSettingsStore = (() => {
  if (!storeInstance) {
    storeInstance = createSettingsStore();
    console.log('🎯 Settings Store: Singleton instance created');
  } else {
    console.log('🎯 Settings Store: Using existing singleton instance');
  }
  return storeInstance;
})();

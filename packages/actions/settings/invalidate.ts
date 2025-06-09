"use server"

import { settingsCacheInvalidation } from "./cacheConfig"
import type { SettingKey } from "./types"

/**
 * Server action to invalidate settings cache
 * This can be called from client components to force cache refresh
 */
export async function invalidateSettingsCache(keys?: SettingKey | SettingKey[]) {
  try {
    if (keys) {
      if (Array.isArray(keys)) {
        keys.forEach(key => settingsCacheInvalidation.invalidateBySingleKey(key))
      } else {
        settingsCacheInvalidation.invalidateBySingleKey(keys)
      }
    }
    
    // Always invalidate all settings to be safe
    settingsCacheInvalidation.invalidateAll()
    
    return { success: true }
  } catch (error) {
    console.error("Failed to invalidate settings cache:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Server action to invalidate specific category settings
 */
export async function invalidateSettingsCategoryCache(category: string) {
  try {
    settingsCacheInvalidation.invalidateByCategory(category)
    settingsCacheInvalidation.invalidateAll()
    
    return { success: true }
  } catch (error) {
    console.error("Failed to invalidate settings category cache:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

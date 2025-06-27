"use server"

import { menuCacheInvalidation } from './cacheConfig'

/**
 * Server action to invalidate menu cache and dispatch refresh events
 */
export async function invalidateMenuCache(menuId?: string, slug?: string) {
  try {
    if (menuId) {
      menuCacheInvalidation.invalidateMenuAndRelated(menuId, slug)
    } else {
      menuCacheInvalidation.invalidateAll()
    }
    
    // Note: dispatchGlobalRefresh is a client-side function, 
    // so we can't call it directly from a server action.
    // The global refresh will be triggered from the client components
    // when they call this server action.
    
    return { success: true }
  } catch (error) {
    console.error("Failed to invalidate menu cache:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Server action to invalidate all menu caches
 */
export async function invalidateAllMenuCaches() {
  try {
    menuCacheInvalidation.invalidateAll()
    
    return { success: true }
  } catch (error) {
    console.error("Failed to invalidate all menu caches:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

"use server"

import { menuCache, menuCacheKeys } from "./cacheConfig"
import * as menuActions from "./get"

// ==========================================
// CACHED FUNCTIONS - REUSING EXISTING ACTIONS
// ==========================================

export async function getMenuBySlug(slug: string) {
  const cachedAction = menuCache.cacheWith(
    () => menuActions.getMenuBySlug(slug),
    [menuCacheKeys.withItemsBySlug(slug)]
  )
  
  return await cachedAction()
}

export async function getAllMenus() {
  const cachedAction = menuCache.cacheWith(
    () => menuActions.getAllMenus(),
    [menuCacheKeys.all]
  )
  
  return await cachedAction()
}

export async function getMenuWithItems(id: string) {
  const cachedAction = menuCache.cacheWith(
    () => menuActions.getMenuWithItems(id),
    [menuCacheKeys.withItems(id)]
  )
  
  return await cachedAction()
}

export async function getLinkableResources() {
  const cachedAction = menuCache.cacheWith(
    () => menuActions.getLinkableResources(),
    [menuCacheKeys.linkableResources]
  )
  
  return await cachedAction()
}

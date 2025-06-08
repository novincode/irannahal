import { commonCaches } from "../cache"

// Menu-specific cache keys
export const menuCacheKeys = {
  all: "all-menus",
  byId: (id: string) => `menu-${id}`,
  bySlug: (slug: string) => `menu-slug-${slug}`,
  withItems: (id: string) => `menu-with-items-${id}`,
  withItemsBySlug: (slug: string) => `menu-with-items-slug-${slug}`,
  userMenus: (userId: string) => `user-menus-${userId}`,
  linkableResources: "linkable-resources",
} as const

// Cache invalidation functions (utility functions)
export const menuCacheInvalidation = {
  // Invalidate all menu caches
  invalidateAll: () => {
    commonCaches.menu.invalidate()
  },

  // Invalidate specific menu by ID
  invalidateById: (id: string) => {
    commonCaches.menu.invalidateSubTag(menuCacheKeys.byId(id))
    commonCaches.menu.invalidateSubTag(menuCacheKeys.withItems(id))
  },

  // Invalidate specific menu by slug
  invalidateBySlug: (slug: string) => {
    commonCaches.menu.invalidateSubTag(menuCacheKeys.bySlug(slug))
    commonCaches.menu.invalidateSubTag(menuCacheKeys.withItemsBySlug(slug))
  },

  // Invalidate all menus list
  invalidateAllMenusList: () => {
    commonCaches.menu.invalidateSubTag(menuCacheKeys.all)
  },

  // Invalidate linkable resources
  invalidateLinkableResources: () => {
    commonCaches.menu.invalidateSubTag(menuCacheKeys.linkableResources)
  },

  // Smart invalidation - when a menu is updated, invalidate related caches
  invalidateMenuAndRelated: (menuId: string, slug?: string) => {
    // Invalidate the specific menu
    menuCacheInvalidation.invalidateById(menuId)
    
    // Invalidate by slug if provided
    if (slug) {
      menuCacheInvalidation.invalidateBySlug(slug)
    }
    
    // Invalidate all menus list (since order might have changed)
    menuCacheInvalidation.invalidateAllMenusList()
  },
}

// Export the menu cache instance
export const menuCache = commonCaches.menu

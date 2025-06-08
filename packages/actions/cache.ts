
import { unstable_cache, revalidateTag } from "next/cache"

/**
 * Creates a cache wrapper with automatic tag management and revalidation
 * 
 * @param tag - Unique cache tag for this resource
 * @param revalidate - TTL in seconds, or false for permanent cache
 * @returns Object with caching utilities
 */
export const makeCache = (tag: string, revalidate: number | false = false) => {
  /**
   * Wraps a function with caching
   */
  const cacheWith = <T>(
    fn: () => Promise<T>,
    keys: string[] = [],
    options?: { revalidate?: number | false }
  ) => {
    const cacheKeys = [tag, ...keys]
    const ttl = options?.revalidate ?? revalidate
    
    return unstable_cache(fn, cacheKeys, { revalidate: ttl })
  }

  /**
   * Revalidates all cache entries with this tag
   */
  const invalidate = () => {
    revalidateTag(tag)
  }

  /**
   * Creates a tagged cache key for more specific invalidation
   */
  const createSubTag = (subKey: string) => `${tag}:${subKey}`

  /**
   * Revalidates a specific sub-tag
   */
  const invalidateSubTag = (subKey: string) => {
    revalidateTag(createSubTag(subKey))
  }

  return {
    cacheWith,
    invalidate,
    createSubTag,
    invalidateSubTag,
    tag,
  }
}

/**
 * Common cache configurations for different resource types
 */
export const cacheConfigs = {
  // Fast-changing data
  realtime: 60, // 1 minute
  
  // Moderate-changing data
  standard: 3600, // 1 hour
  
  // Slow-changing data
  longTerm: 86400, // 1 day
  
  // Very stable data
  persistent: 2592000, // 30 days
  
  // Never expires (manual invalidation only)
  permanent: false,
} as const

/**
 * Pre-configured cache instances for common resources
 */
export const commonCaches = {
  menu: makeCache("menu", cacheConfigs.persistent),
  products: makeCache("products", cacheConfigs.standard),
  categories: makeCache("categories", cacheConfigs.longTerm),
  posts: makeCache("posts", cacheConfigs.standard),
  users: makeCache("users", cacheConfigs.standard),
  orders: makeCache("orders", cacheConfigs.realtime),
  settings: makeCache("settings", cacheConfigs.persistent),
} as const
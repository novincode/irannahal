"use server"

import { productCache, productCacheKeys } from "./cacheConfig"
import * as productActions from "./get"
import type { ProductFilterParams, CategoryArchiveParams, TagArchiveParams, ProductRelations } from "./types"

// ==========================================
// CACHED FUNCTIONS - REUSING EXISTING ACTIONS
// ==========================================

export async function getProductsArchive(filters: ProductFilterParams = {}) {
  // Create a stable cache key from filters
  const filterKey = JSON.stringify(filters)
  
  const cachedAction = productCache.cacheWith(
    () => productActions.getProductsArchive(filters),
    [productCacheKeys.archive(filterKey)]
  )
  
  return await cachedAction()
}

export async function getProductsByCategory(params: CategoryArchiveParams) {
  // Create a stable cache key from category and filters
  const filterKey = JSON.stringify(params.filters || {})
  
  const cachedAction = productCache.cacheWith(
    () => productActions.getProductsByCategory(params),
    [productCacheKeys.categoryArchive(params.categorySlug, filterKey)]
  )
  
  return await cachedAction()
}

export async function getProductsByTag(params: TagArchiveParams) {
  // Create a stable cache key from tag and filters
  const filterKey = JSON.stringify(params.filters || {})
  
  const cachedAction = productCache.cacheWith(
    () => productActions.getProductsByTag(params),
    [productCacheKeys.tagArchive(params.tagSlug, filterKey)]
  )
  
  return await cachedAction()
}

export async function getAvailableFilters(baseFilters: Partial<ProductFilterParams> = {}) {
  // Create a stable cache key from base filters
  const filterKey = JSON.stringify(baseFilters)
  
  const cachedAction = productCache.cacheWith(
    () => productActions.getAvailableFilters(baseFilters),
    [productCacheKeys.availableFilters(filterKey)]
  )
  
  return await cachedAction()
}

export async function getProductBySlug(slug: string) {
  const cachedAction = productCache.cacheWith(
    () => productActions.getProductBySlug(slug),
    [productCacheKeys.bySlug(slug)]
  )
  
  return await cachedAction()
}

export async function getProductById(id: string) {
  const cachedAction = productCache.cacheWith(
    () => productActions.getProductById(id),
    [productCacheKeys.byId(id)]
  )
  
  return await cachedAction()
}

// Generic product fetching function with optional relations
export async function getProduct<TWith extends ProductRelations>(
  id: string,
  opts?: { with?: TWith }
) {
  const cachedAction = productCache.cacheWith(
    () => productActions.getProduct(id, opts),
    [productCacheKeys.byId(id)]
  )
  
  return await cachedAction()
}

// Additional cached functions for common use cases
export async function getFeaturedProducts(limit: number = 8) {
  const cachedAction = productCache.cacheWith(
    () => productActions.getProductsArchive({ 
      limit, 
      sortBy: 'popularity',
      status: ['active'] 
    }),
    [productCacheKeys.featuredProducts]
  )
  
  return await cachedAction()
}

export async function getPopularProducts(limit: number = 8) {
  const cachedAction = productCache.cacheWith(
    () => productActions.getProductsArchive({ 
      limit, 
      sortBy: 'popularity',
      status: ['active'] 
    }),
    [productCacheKeys.popularProducts]
  )
  
  return await cachedAction()
}

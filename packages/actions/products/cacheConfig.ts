import { commonCaches } from "../cache"

// Product-specific cache keys
export const productCacheKeys = {
  // Basic product queries
  all: "all-products",
  byId: (id: string) => `product-${id}`,
  bySlug: (slug: string) => `product-slug-${slug}`,
  
  // Archive and filtering
  archive: (filters: string) => `products-archive-${filters}`,
  categoryArchive: (categorySlug: string, filters: string) => `category-${categorySlug}-archive-${filters}`,
  tagArchive: (tagSlug: string, filters: string) => `tag-${tagSlug}-archive-${filters}`,
  
  // Filter data
  availableFilters: (baseFilters: string) => `available-filters-${baseFilters}`,
  
  // Related data
  relatedProducts: (productId: string) => `related-products-${productId}`,
  popularProducts: "popular-products",
  featuredProducts: "featured-products",
} as const

// Cache invalidation functions (utility functions)
export const productCacheInvalidation = {
  // Invalidate all product caches
  invalidateAll: () => {
    commonCaches.products.invalidate()
  },

  // Invalidate specific product by ID
  invalidateById: (id: string) => {
    commonCaches.products.invalidateSubTag(productCacheKeys.byId(id))
    commonCaches.products.invalidateSubTag(productCacheKeys.relatedProducts(id))
  },

  // Invalidate specific product by slug
  invalidateBySlug: (slug: string) => {
    commonCaches.products.invalidateSubTag(productCacheKeys.bySlug(slug))
  },

  // Invalidate all products list and archives
  invalidateArchives: () => {
    commonCaches.products.invalidateSubTag(productCacheKeys.all)
    // Invalidate all archive-related caches
    commonCaches.products.invalidate() // This will clear all product archives
  },

  // Invalidate category-specific archives
  invalidateCategoryArchive: (categorySlug: string) => {
    // This is a bit broad but ensures consistency
    commonCaches.products.invalidate()
  },

  // Invalidate tag-specific archives
  invalidateTagArchive: (tagSlug: string) => {
    // This is a bit broad but ensures consistency
    commonCaches.products.invalidate()
  },

  // Invalidate filter data
  invalidateFilters: () => {
    // Since available filters depend on current products, invalidate all
    commonCaches.products.invalidate()
  },

  // Smart invalidation - when a product is updated, invalidate related caches
  invalidateProductAndRelated: (productId: string, slug?: string, categoryIds?: string[], tagIds?: string[]) => {
    // Invalidate the specific product
    productCacheInvalidation.invalidateById(productId)
    
    // Invalidate by slug if provided
    if (slug) {
      productCacheInvalidation.invalidateBySlug(slug)
    }
    
    // Invalidate archives since product data changed
    productCacheInvalidation.invalidateArchives()
    
    // Invalidate popular/featured if this could affect them
    commonCaches.products.invalidateSubTag(productCacheKeys.popularProducts)
    commonCaches.products.invalidateSubTag(productCacheKeys.featuredProducts)
  },

  // When categories change, invalidate related product caches
  invalidateByCategory: (categorySlug: string) => {
    productCacheInvalidation.invalidateCategoryArchive(categorySlug)
  },

  // When tags change, invalidate related product caches
  invalidateByTag: (tagSlug: string) => {
    productCacheInvalidation.invalidateTagArchive(tagSlug)
  },
} as const

// Re-export the cache instance for use
export const productCache = commonCaches.products

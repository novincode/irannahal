import type {
  ProductSchema,
  TagSchema,
  CategorySchema,
  DownloadSchema,
  MediaSchema,
} from "@db/types"

import type { WithRelations, RelationInput } from "@db/relation-helpers"

export const productRelationNames = ["tags", "categories", "downloads", "media", "meta", "thumbnail"] as const
export type ProductRelationName = typeof productRelationNames[number]

export type ProductMetaRow = { id: string; type: string; key: string; value: string | null; postId?: string | null; productId?: string | null }

export type ProductRelationsMap = {
  tags: TagSchema[]
  categories: CategorySchema[]
  downloads: DownloadSchema[]
  media: MediaSchema[]
  meta: ProductMetaRow[]
  thumbnail: MediaSchema | null
}

export type ProductRelations = RelationInput<ProductRelationsMap>
export type ProductWithDynamicRelations<TWith extends ProductRelations = {}> = WithRelations<
  ProductSchema,
  ProductRelationsMap,
  TWith
>

// Optional: IDE helper
export const productWith = <T extends ProductRelations>(relations: T) => relations

// ========== PRODUCT ARCHIVE & FILTERING TYPES ==========

export type ProductSortBy = 
  | 'newest' 
  | 'oldest' 
  | 'name-asc' 
  | 'name-desc' 
  | 'price-asc' 
  | 'price-desc'
  | 'popularity'

export type ProductStatus = 'draft' | 'active' | 'inactive'

export interface ProductFilterParams {
  // Search & Core
  search?: string
  status?: ProductStatus[]
  
  // Categories & Tags (max 3 categories)
  categories?: string[]  // category slugs
  tags?: string[]        // tag slugs
  
  // Pricing
  minPrice?: number
  maxPrice?: number
  
  // Product Type
  isDownloadable?: boolean
  
  // Pagination & Sorting
  page?: number
  limit?: number
  sortBy?: ProductSortBy
  
  // URL state management
  [key: string]: any
}

export interface ProductArchiveResult {
  products: ProductWithDynamicRelations<{
    categories: true
    tags: true
    thumbnail: true
    meta: true
  }>[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: {
    appliedFilters: ProductFilterParams
    availableFilters: {
      categories: { id: string; name: string; slug: string; count: number }[]
      tags: { id: string; name: string; slug: string; count: number }[]
      priceRange: { min: number; max: number }
      productCount: {
        total: number
        downloadable: number
        physical: number
      }
    }
  }
}

export interface AvailableFilters {
  categories: { id: string; name: string; slug: string; count: number }[]
  tags: { id: string; name: string; slug: string; count: number }[]
  priceRange: { min: number; max: number }
  productCount: {
    total: number
    downloadable: number
    physical: number
  }
}

export interface CategoryArchiveParams {
  categorySlug: string
  filters?: Omit<ProductFilterParams, 'categories'>
}

export interface TagArchiveParams {
  tagSlug: string
  filters?: Omit<ProductFilterParams, 'tags'>
}

// URL state management types
export interface URLFilterState {
  search?: string
  categories?: string
  tags?: string
  minPrice?: string
  maxPrice?: string
  isDownloadable?: string
  sortBy?: string
  page?: string
}

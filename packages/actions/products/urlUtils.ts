import type { ProductFilterParams, URLFilterState } from './types'

// ========== URL STATE MANAGEMENT ==========

export function parseFiltersFromURL(searchParams: URLSearchParams): ProductFilterParams {
  const filters: ProductFilterParams = {}
  
  // Search
  const search = searchParams.get('search')
  if (search) filters.search = search
  
  // Categories (comma-separated, max 3)
  const categories = searchParams.get('categories')
  if (categories) {
    filters.categories = categories.split(',').slice(0, 3).filter(Boolean)
  }
  
  // Tags (comma-separated)
  const tags = searchParams.get('tags')
  if (tags) {
    filters.tags = tags.split(',').filter(Boolean)
  }
  
  // Price range
  const minPrice = searchParams.get('minPrice')
  if (minPrice && !isNaN(Number(minPrice))) {
    filters.minPrice = Number(minPrice)
  }
  
  const maxPrice = searchParams.get('maxPrice')
  if (maxPrice && !isNaN(Number(maxPrice))) {
    filters.maxPrice = Number(maxPrice)
  }
  
  // Downloadable filter
  const isDownloadable = searchParams.get('isDownloadable')
  if (isDownloadable === 'true') {
    filters.isDownloadable = true
  } else if (isDownloadable === 'false') {
    filters.isDownloadable = false
  }
  
  // Sorting
  const sortBy = searchParams.get('sortBy')
  if (sortBy && isValidSortBy(sortBy)) {
    filters.sortBy = sortBy as any
  }
  
  // Pagination
  const page = searchParams.get('page')
  if (page && !isNaN(Number(page))) {
    filters.page = Math.max(1, Number(page))
  }
  
  const limit = searchParams.get('limit')
  if (limit && !isNaN(Number(limit))) {
    filters.limit = Math.min(50, Math.max(1, Number(limit)))
  }
  
  return filters
}

export function buildURLFromFilters(filters: ProductFilterParams): string {
  const params = new URLSearchParams()
  
  // Only add non-empty/non-default values
  if (filters.search) {
    params.set('search', filters.search)
  }
  
  if (filters.categories?.length) {
    params.set('categories', filters.categories.slice(0, 3).join(','))
  }
  
  if (filters.tags?.length) {
    params.set('tags', filters.tags.join(','))
  }
  
  if (filters.minPrice !== undefined) {
    params.set('minPrice', filters.minPrice.toString())
  }
  
  if (filters.maxPrice !== undefined) {
    params.set('maxPrice', filters.maxPrice.toString())
  }
  
  if (filters.isDownloadable !== undefined) {
    params.set('isDownloadable', filters.isDownloadable.toString())
  }
  
  if (filters.sortBy && filters.sortBy !== 'newest') {
    params.set('sortBy', filters.sortBy)
  }
  
  if (filters.page && filters.page > 1) {
    params.set('page', filters.page.toString())
  }
  
  if (filters.limit && filters.limit !== 12) {
    params.set('limit', filters.limit.toString())
  }
  
  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

export function updateURLFilters(
  currentFilters: ProductFilterParams, 
  updates: Partial<ProductFilterParams>
): ProductFilterParams {
  const newFilters = { ...currentFilters, ...updates }
  
  // Reset page when filters change (except page itself)
  const hasFilterChange = Object.keys(updates).some(key => key !== 'page')
  if (hasFilterChange) {
    newFilters.page = 1
  }
  
  // Clean up undefined values
  Object.keys(newFilters).forEach(key => {
    if (newFilters[key as keyof ProductFilterParams] === undefined) {
      delete newFilters[key as keyof ProductFilterParams]
    }
  })
  
  return newFilters
}

function isValidSortBy(value: string): boolean {
  const validSorts = ['newest', 'oldest', 'name-asc', 'name-desc', 'price-asc', 'price-desc', 'popularity']
  return validSorts.includes(value)
}

// Helper for category/tag archive pages
export function getCategoryArchiveURL(categorySlug: string, filters: Partial<ProductFilterParams> = {}): string {
  const filtersCopy = { ...filters }
  delete filtersCopy.categories // Remove categories since it's in the URL path
  
  const queryString = buildURLFromFilters(filtersCopy)
  return `/products/category/${categorySlug}${queryString}`
}

export function getTagArchiveURL(tagSlug: string, filters: Partial<ProductFilterParams> = {}): string {
  const filtersCopy = { ...filters }
  delete filtersCopy.tags // Remove tags since it's in the URL path
  
  const queryString = buildURLFromFilters(filtersCopy)
  return `/products/tag/${tagSlug}${queryString}`
}

export function getProductsArchiveURL(filters: ProductFilterParams = {}): string {
  const queryString = buildURLFromFilters(filters)
  return `/products${queryString}`
}

// Client-side helpers for React components
export const urlUtils = {
  parseFiltersFromURL,
  buildURLFromFilters,
  updateURLFilters,
  getCategoryArchiveURL,
  getTagArchiveURL,
  getProductsArchiveURL,
}

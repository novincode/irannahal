"use server"

import { db } from "@db"
import { products, categories, tags, productCategories, productTags, media } from "@db/schema"
import { and, eq, or, ilike, gte, lte, sql, desc, asc, count, inArray } from "drizzle-orm"
import type { 
  ProductFilterParams, 
  ProductArchiveResult, 
  CategoryArchiveParams, 
  TagArchiveParams,
  AvailableFilters,
  ProductWithDynamicRelations,
  ProductRelations
} from "./types"

// ==========================================
// CORE PRODUCT FETCHING FUNCTIONS
// ==========================================

export async function getProductById(id: string) {
  const result = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      categories: {
        with: {
          category: true
        }
      },
      tags: {
        with: {
          tag: true
        }
      },
      downloads: true,
      media: true,
      meta: true,
      thumbnail: true,
    },
  })

  if (!result) return null

  // Transform the result to match expected format
  return {
    ...result,
    categories: (result as any).categories?.map((pc: any) => pc.category) || [],
    tags: (result as any).tags?.map((pt: any) => pt.tag) || [],
  }
}

export async function getProductBySlug(slug: string) {
  const result = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      categories: {
        with: {
          category: true
        }
      },
      tags: {
        with: {
          tag: true
        }
      },
      downloads: true,
      media: true,
      meta: true,
      thumbnail: true,
    },
  })

  if (!result) return null

  // Transform the result to match expected format
  return {
    ...result,
    categories: (result as any).categories?.map((pc: any) => pc.category) || [],
    tags: (result as any).tags?.map((pt: any) => pt.tag) || [],
  }
}

// Generic product fetching function with optional relations
export async function getProduct<TWith extends ProductRelations>(
  id: string,
  opts?: { with?: TWith }
): Promise<ProductWithDynamicRelations<TWith> | null> {
  // Build the with clause conditionally
  const withClause: any = {}
  
  if (opts?.with?.categories) {
    withClause.categories = {
      with: {
        category: true
      }
    }
  }
  
  if (opts?.with?.tags) {
    withClause.tags = {
      with: {
        tag: true
      }
    }
  }
  
  if (opts?.with?.downloads) {
    withClause.downloads = true
  }
  
  if (opts?.with?.media) {
    withClause.media = true
  }
  
  if (opts?.with?.meta) {
    withClause.meta = true
  }
  
  if (opts?.with?.thumbnail) {
    withClause.thumbnail = true
  }

  const result = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: withClause,
  })
  
  if (!result) return null

  // Transform the result to match expected format
  const transformed: any = { ...result }
  
  if (opts?.with?.categories && (result as any).categories) {
    transformed.categories = (result as any).categories.map((pc: any) => pc.category)
  }
  
  if (opts?.with?.tags && (result as any).tags) {
    transformed.tags = (result as any).tags.map((pt: any) => pt.tag)
  }
  
  return transformed as ProductWithDynamicRelations<TWith>
}

export async function getProducts<TWith extends ProductRelations>(
  opts?: { with?: TWith }
): Promise<ProductWithDynamicRelations<TWith>[]> {
  // Build the with clause conditionally
  const withClause: any = {}
  
  if (opts?.with?.categories) {
    withClause.categories = {
      with: {
        category: true
      }
    }
  }
  
  if (opts?.with?.tags) {
    withClause.tags = {
      with: {
        tag: true
      }
    }
  }
  
  if (opts?.with?.downloads) {
    withClause.downloads = true
  }
  
  if (opts?.with?.media) {
    withClause.media = true
  }
  
  if (opts?.with?.meta) {
    withClause.meta = true
  }
  
  if (opts?.with?.thumbnail) {
    withClause.thumbnail = true
  }

  const results = await db.query.products.findMany({
    where: eq(products.status, 'active'),
    with: withClause,
  })
  
  // Transform the results to match expected format
  const transformed = results.map((result: any) => {
    const item: any = { ...result }
    
    if (opts?.with?.categories && result.categories) {
      item.categories = result.categories.map((pc: any) => pc.category)
    }
    
    if (opts?.with?.tags && result.tags) {
      item.tags = result.tags.map((pt: any) => pt.tag)
    }
    
    return item
  })
  
  return transformed as ProductWithDynamicRelations<TWith>[]
}

// Admin version - returns ALL products regardless of status
export async function getAllProducts<TWith extends ProductRelations>(
  opts?: { with?: TWith }
): Promise<ProductWithDynamicRelations<TWith>[]> {
  // Build the with clause conditionally
  const withClause: any = {}
  
  if (opts?.with?.categories) {
    withClause.categories = {
      with: {
        category: true
      }
    }
  }
  
  if (opts?.with?.tags) {
    withClause.tags = {
      with: {
        tag: true
      }
    }
  }
  
  if (opts?.with?.downloads) {
    withClause.downloads = true
  }
  
  if (opts?.with?.media) {
    withClause.media = true
  }
  
  if (opts?.with?.meta) {
    withClause.meta = true
  }
  
  if (opts?.with?.thumbnail) {
    withClause.thumbnail = true
  }

  const results = await db.query.products.findMany({
    // No where clause - get ALL products
    with: withClause,
    orderBy: [desc(products.createdAt)] // Order by newest first
  })
  
  // Transform the results to match expected format
  const transformed = results.map((result: any) => {
    const item: any = { ...result }
    
    if (opts?.with?.categories && result.categories) {
      item.categories = result.categories.map((pc: any) => pc.category)
    }
    
    if (opts?.with?.tags && result.tags) {
      item.tags = result.tags.map((pt: any) => pt.tag)
    }
    
    return item
  })
  
  return transformed as ProductWithDynamicRelations<TWith>[]
}

// ==========================================
// ADVANCED FILTERING & ARCHIVE FUNCTIONS
// ==========================================

export async function getProductsArchive(filters: ProductFilterParams = {}): Promise<ProductArchiveResult> {
  const {
    search,
    status = ['active'],
    categories: categoryFilter = [],
    tags: tagFilter = [],
    minPrice,
    maxPrice,
    isDownloadable,
    page = 1,
    limit = 12,
    sortBy = 'newest'
  } = filters

  // Build WHERE conditions
  const conditions = []
  
  // Status filter
  if (status.length > 0) {
    conditions.push(inArray(products.status, status))
  }

  // Search filter
  if (search) {
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.description, `%${search}%`),
        ilike(products.content, `%${search}%`)
      )
    )
  }

  // Price range filter
  if (minPrice !== undefined) {
    conditions.push(gte(products.price, minPrice))
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(products.price, maxPrice))
  }

  // Downloadable filter
  if (isDownloadable !== undefined) {
    conditions.push(eq(products.isDownloadable, isDownloadable))
  }

  // Get product IDs that match category filter
  let productIdsFromCategories: string[] = []
  if (categoryFilter.length > 0) {
    const categoryResults = await db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(inArray(categories.slug, categoryFilter.slice(0, 3)))
    
    productIdsFromCategories = categoryResults.map(r => r.productId).filter(Boolean) as string[]
    
    if (productIdsFromCategories.length > 0) {
      conditions.push(inArray(products.id, productIdsFromCategories))
    } else {
      // No products found for these categories
      return {
        products: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        filters: {
          appliedFilters: filters,
          availableFilters: await getAvailableFilters(filters),
        },
      }
    }
  }

  // Get product IDs that match tag filter
  let productIdsFromTags: string[] = []
  if (tagFilter.length > 0) {
    const tagResults = await db
      .select({ productId: productTags.productId })
      .from(productTags)
      .innerJoin(tags, eq(productTags.tagId, tags.id))
      .where(inArray(tags.slug, tagFilter))
    
    productIdsFromTags = tagResults.map(r => r.productId).filter(Boolean) as string[]
    
    if (productIdsFromTags.length > 0) {
      if (productIdsFromCategories.length > 0) {
        // Intersection of both filters
        const intersection = productIdsFromCategories.filter(id => productIdsFromTags.includes(id))
        if (intersection.length > 0) {
          conditions.push(inArray(products.id, intersection))
        } else {
          // No intersection found
          return {
            products: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
            filters: {
              appliedFilters: filters,
              availableFilters: await getAvailableFilters(filters),
            },
          }
        }
      } else {
        conditions.push(inArray(products.id, productIdsFromTags))
      }
    } else {
      // No products found for these tags
      return {
        products: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        filters: {
          appliedFilters: filters,
          availableFilters: await getAvailableFilters(filters),
        },
      }
    }
  }

  // Build sort order
  const sortOptions = {
    newest: desc(products.createdAt),
    oldest: asc(products.createdAt),
    'name-asc': asc(products.name),
    'name-desc': desc(products.name),
    'price-asc': asc(products.price),
    'price-desc': desc(products.price),
    popularity: desc(products.createdAt), // Fallback to newest for now
  }

  const orderBy = sortOptions[sortBy] || sortOptions.newest

  // Calculate offset
  const offset = (page - 1) * limit

  // Get total count first
  const [totalResult] = await db
    .select({ count: count() })
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  const total = totalResult?.count || 0
  const totalPages = Math.ceil(total / limit)

  // Get products with full relations using the query builder
  const productsWithRelations = await db.query.products.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      categories: {
        with: {
          category: true
        }
      },
      tags: {
        with: {
          tag: true
        }
      },
      thumbnail: true,
      meta: true,
    },
    orderBy: [orderBy],
    limit,
    offset,
  })

  // Transform the results to match expected format
  const transformedProducts = productsWithRelations.map((result: any) => ({
    ...result,
    categories: result.categories?.map((pc: any) => pc.category) || [],
    tags: result.tags?.map((pt: any) => pt.tag) || [],
  }))

  // Get available filters
  const availableFilters = await getAvailableFilters(filters)

  return {
    products: transformedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    filters: {
      appliedFilters: filters,
      availableFilters,
    },
  }
}

export async function getProductsByCategory(params: CategoryArchiveParams): Promise<ProductArchiveResult> {
  const { categorySlug, filters = {} } = params
  
  // Add the category to the filters
  const categoryFilters: ProductFilterParams = {
    ...filters,
    categories: [categorySlug],
  }
  
  return getProductsArchive(categoryFilters)
}

export async function getProductsByTag(params: TagArchiveParams): Promise<ProductArchiveResult> {
  const { tagSlug, filters = {} } = params
  
  // Add the tag to the filters
  const tagFilters: ProductFilterParams = {
    ...filters,
    tags: [tagSlug],
  }
  
  return getProductsArchive(tagFilters)
}

export async function getAvailableFilters(baseFilters: Partial<ProductFilterParams> = {}): Promise<AvailableFilters> {
  // Get all categories with product counts
  const categoriesWithCounts = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      count: count(products.id),
    })
    .from(categories)
    .leftJoin(productCategories, eq(categories.id, productCategories.categoryId))
    .leftJoin(products, and(
      eq(productCategories.productId, products.id),
      eq(products.status, 'active')
    ))
    .groupBy(categories.id, categories.name, categories.slug)
    .having(({ count }) => gte(count, 1))

  // Get all tags with product counts
  const tagsWithCounts = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      count: count(products.id),
    })
    .from(tags)
    .leftJoin(productTags, eq(tags.id, productTags.tagId))
    .leftJoin(products, and(
      eq(productTags.productId, products.id),
      eq(products.status, 'active')
    ))
    .groupBy(tags.id, tags.name, tags.slug)
    .having(({ count }) => gte(count, 1))

  // Get price range
  const [priceRange] = await db
    .select({
      min: sql<number>`COALESCE(MIN(${products.price}), 0)`,
      max: sql<number>`COALESCE(MAX(${products.price}), 0)`,
    })
    .from(products)
    .where(eq(products.status, 'active'))

  // Get product counts
  const [productCounts] = await db
    .select({
      total: count(),
      downloadable: sql<number>`COUNT(CASE WHEN ${products.isDownloadable} = true THEN 1 END)`,
      physical: sql<number>`COUNT(CASE WHEN ${products.isDownloadable} = false THEN 1 END)`,
    })
    .from(products)
    .where(eq(products.status, 'active'))

  return {
    categories: categoriesWithCounts,
    tags: tagsWithCounts,
    priceRange: {
      min: priceRange?.min || 0,
      max: priceRange?.max || 0,
    },
    productCount: {
      total: productCounts?.total || 0,
      downloadable: productCounts?.downloadable || 0,
      physical: productCounts?.physical || 0,
    },
  }
}
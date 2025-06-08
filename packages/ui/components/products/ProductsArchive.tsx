'use client'

import React, { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { 
  ProductArchiveResult, 
  ProductFilterParams, 
  AvailableFilters,
  ProductSortBy 
} from '@actions/products/types'
import { urlUtils } from '@actions/products/urlUtils'
import { ProductArchive } from './ProductArchive'
import { ProductsFilters } from './filters/ProductsFilters'
import { ProductsSorting } from './filters/ProductsSorting'
import { ProductsPagination } from './filters/ProductsPagination'
import { ProductsViewToggle } from './filters/ProductsViewToggle'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/components/ui/card'
import { Separator } from '@ui/components/ui/separator'
import { Package, Filter } from 'lucide-react'

interface ProductsArchiveProps {
  archiveResult: ProductArchiveResult
  availableFilters: AvailableFilters
  currentFilters: ProductFilterParams
  basePath?: string // e.g., '/products', '/products/category/electronics'
  title?: string
  description?: string
}

export function ProductsArchive({ 
  archiveResult, 
  availableFilters, 
  currentFilters,
  basePath = '/products',
  title = 'محصولات',
  description
}: ProductsArchiveProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Handle filter updates
  const handleFiltersChange = (updates: Partial<ProductFilterParams>) => {
    const newFilters = urlUtils.updateURLFilters(currentFilters, updates)
    const queryString = urlUtils.buildURLFromFilters(newFilters)
    router.push(`${basePath}${queryString}`)
  }

  // Handle sort change
  const handleSortChange = (sortBy: ProductSortBy) => {
    handleFiltersChange({ sortBy })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    handleFiltersChange({ page })
  }

  // Handle view mode change
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  const { products, pagination } = archiveResult
  const { total, totalPages, page: currentPage } = pagination

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      currentFilters.search ||
      currentFilters.categories?.length ||
      currentFilters.tags?.length ||
      currentFilters.minPrice !== undefined ||
      currentFilters.maxPrice !== undefined ||
      currentFilters.isDownloadable !== undefined
    )
  }, [currentFilters])

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4 flex-col md:flex-row">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold break-words">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1 break-words">{description}</p>
            )}
          </div>
          
          {/* View Toggle & Sort */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <ProductsViewToggle 
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <ProductsSorting
              currentSort={currentFilters.sortBy || 'newest'}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>
              نمایش {((currentPage - 1) * (currentFilters.limit || 12)) + 1} تا{' '}
              {Math.min(currentPage * (currentFilters.limit || 12), total)} از {total} محصول
            </span>
            {hasActiveFilters && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  فیلتر اعمال شده
                </span>
              </>
            )}
          </div>
        </div>

        <Separator className="mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">فیلترها</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsFilters
                filters={currentFilters}
                availableFilters={availableFilters}
                onFiltersChange={handleFiltersChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">محصولی یافت نشد</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {hasActiveFilters 
                    ? 'هیچ محصولی با فیلترهای انتخاب شده یافت نشد. لطفاً فیلترها را تغییر دهید.'
                    : 'در حال حاضر محصولی در این دسته‌بندی وجود ندارد.'
                  }
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={() => handleFiltersChange({
                      search: undefined,
                      categories: undefined,
                      tags: undefined,
                      minPrice: undefined,
                      maxPrice: undefined,
                      isDownloadable: undefined,
                      page: 1
                    })}
                    className="text-primary hover:underline"
                  >
                    پاک کردن همه فیلترها
                  </button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Products Grid/List */}
              <ProductArchive 
                products={products} 
                viewMode={viewMode}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <ProductsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    limit={currentFilters.limit || 12}
                    onPageChange={handlePageChange}
                    onLimitChange={(limit) => handleFiltersChange({ limit, page: 1 })}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
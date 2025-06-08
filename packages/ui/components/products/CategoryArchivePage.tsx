'use client'

import React from 'react'
import { ProductsArchive } from './ProductsArchive'
import type { 
  ProductArchiveResult, 
  ProductFilterParams, 
  AvailableFilters 
} from '@actions/products/types'
import type { CategoryWithDynamicRelations } from '@actions/categories/types'

interface CategoryArchivePageProps {
  category: CategoryWithDynamicRelations<{}>
  archiveResult: ProductArchiveResult
  availableFilters: AvailableFilters
  currentFilters: ProductFilterParams
}

export function CategoryArchivePage({ 
  category, 
  archiveResult, 
  availableFilters, 
  currentFilters 
}: CategoryArchivePageProps) {
  const basePath = `/products/category/${category.slug}`
  
  return (
    <ProductsArchive
      archiveResult={archiveResult}
      availableFilters={availableFilters}
      currentFilters={currentFilters}
      basePath={basePath}
      title={`دسته‌بندی: ${category.name}`}
      description={`مشاهده ${archiveResult.pagination.total} محصول در دسته‌بندی ${category.name}`}
    />
  )
}

'use client'

import React from 'react'
import { ProductsArchive } from './ProductsArchive'
import type { 
  ProductArchiveResult, 
  ProductFilterParams, 
  AvailableFilters 
} from '@actions/products/types'
import type { TagWithDynamicRelations } from '@actions/tags/types'

interface TagArchivePageProps {
  tag: TagWithDynamicRelations<{}>
  archiveResult: ProductArchiveResult
  availableFilters: AvailableFilters
  currentFilters: ProductFilterParams
}

export function TagArchivePage({ 
  tag, 
  archiveResult, 
  availableFilters, 
  currentFilters 
}: TagArchivePageProps) {
  const basePath = `/products/tag/${tag.slug}`
  
  return (
    <ProductsArchive
      archiveResult={archiveResult}
      availableFilters={availableFilters}
      currentFilters={currentFilters}
      basePath={basePath}
      title={`برچسب: ${tag.name}`}
      description={`مشاهده ${archiveResult.pagination.total} محصول با برچسب ${tag.name}`}
    />
  )
}

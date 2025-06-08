'use client'

import React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@ui/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select"
import { Label } from "@ui/components/ui/label"

interface ProductsPaginationProps {
  currentPage: number
  totalPages: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

const limitOptions = [12, 24, 48, 96]

export function ProductsPagination({
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange
}: ProductsPaginationProps) {
  if (totalPages <= 1 && !onLimitChange) {
    return null
  }
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const showPages = 5 // Show 5 page numbers at most
    
    if (totalPages <= showPages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('ellipsis-start')
      }
      
      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis-end')
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => (
          <PaginationItem key={index}>
            {typeof page === 'number' ? (
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={page === currentPage}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext 
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

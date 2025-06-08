'use client'

import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/components/ui/select'
import type { ProductSortBy } from '@actions/products/types'

interface ProductsSortingProps {
  currentSort: ProductSortBy
  onSortChange: (sort: ProductSortBy) => void
}

const sortOptions = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'oldest', label: 'قدیمی‌ترین' },
  { value: 'name-asc', label: 'نام: الف تا ی' },
  { value: 'name-desc', label: 'نام: ی تا الف' },
  { value: 'price-asc', label: 'قیمت: کم به زیاد' },
  { value: 'price-desc', label: 'قیمت: زیاد به کم' },
  { value: 'popularity', label: 'محبوب‌ترین' },
] as const

export function ProductsSorting({ currentSort, onSortChange }: ProductsSortingProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">مرتب‌سازی:</span>
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

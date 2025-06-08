'use client'

import React from 'react'
import { Button } from '@ui/components/ui/button'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@ui/lib/utils'

export type ViewMode = "grid" | "list"

interface ProductsViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  className?: string
}

export function ProductsViewToggle({ viewMode, onViewModeChange, className }: ProductsViewToggleProps) {
  return (
    <div className={cn("flex items-center border rounded-md p-1", className)}>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="h-8 w-8 p-0"
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="h-8 w-8 p-0"
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}

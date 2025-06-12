"use client"

import * as React from "react"
import { Button } from "@ui/components/ui/button"
import { Badge } from "@ui/components/ui/badge"
import { Save, Plus, RotateCcw } from "lucide-react"
import { usePostEditorStore } from "@data/usePostEditorStore"
import { getBlocksForPostType } from "./blockRegistry"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/components/ui/dropdown-menu"

// ==========================================
// TYPES
// ==========================================

interface PostEditorToolbarProps {
  postType: string
  submitLabel?: string
  form: any
}

// ==========================================
// COMPONENT
// ==========================================

export function PostEditorToolbar({ 
  postType, 
  submitLabel = "ذخیره",
  form 
}: PostEditorToolbarProps) {
  const store = usePostEditorStore()
  const availableBlocks = getBlocksForPostType(postType)
  
  const handleAddBlock = (blockType: string, column: 'left' | 'right') => {
    store.addBlock(blockType, column)
  }
  
  const handleReset = () => {
    store.resetForm()
    form.reset(store.originalData)
  }
  
  return (
    <div className="flex items-center justify-between border-t pt-4 mt-6">
      <div className="flex items-center gap-3">
        {store.isDirty && (
          <Badge variant="secondary" className="text-xs">
            تغییر یافته
          </Badge>
        )}
        
        {store.isSaving && (
          <Badge variant="outline" className="text-xs">
            در حال ذخیره...
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Add Block Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 ml-2" />
              افزودن بلاک
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>افزودن به ستون چپ</DropdownMenuLabel>
            {availableBlocks
              .filter(block => 
                block.supports.placement === 'left' || 
                block.supports.placement === 'both' ||
                !block.supports.placement
              )
              .map(block => (
                <DropdownMenuItem
                  key={`left-${block.id}`}
                  onClick={() => handleAddBlock(block.id, 'left')}
                >
                  {block.title}
                </DropdownMenuItem>
              ))
            }
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>افزودن به ستون راست</DropdownMenuLabel>
            {availableBlocks
              .filter(block => 
                block.supports.placement === 'right' || 
                block.supports.placement === 'both' ||
                !block.supports.placement
              )
              .map(block => (
                <DropdownMenuItem
                  key={`right-${block.id}`}
                  onClick={() => handleAddBlock(block.id, 'right')}
                >
                  {block.title}
                </DropdownMenuItem>
              ))
            }
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Reset Button */}
        {store.isDirty && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            بازگردانی
          </Button>
        )}
        
        {/* Save Button */}
        <Button 
          type="submit" 
          disabled={store.isSaving || !store.isDirty}
          size="sm"
        >
          <Save className="w-4 h-4 ml-2" />
          {store.isSaving ? 'در حال ذخیره...' : submitLabel}
        </Button>
      </div>
    </div>
  )
}

// ==========================================
// UTILITIES
// ==========================================

function getPostTypeLabel(postType: string): string {
  const labels = {
    product: 'محصول',
    post: 'نوشته',
    page: 'صفحه',
  }
  
  return labels[postType as keyof typeof labels] || postType
}

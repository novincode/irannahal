'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@shadcn/card'
import { Button } from '@shadcn/button'
import { Badge } from '@shadcn/badge'
import { 
  GripVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react'
import type { MenuItemWithChildren } from '@actions/menu/types'
import { cn } from '@ui/lib/utils'

interface SortableMenuItemProps {
  item: MenuItemWithChildren
  depth: number
  onEdit: (item: MenuItemWithChildren) => void
  onDelete: (itemId: string) => void
  isDragging?: boolean
}

const getItemTypeColor = (type: string) => {
  const colors = {
    custom: 'bg-blue-100 text-blue-800',
    page: 'bg-green-100 text-green-800',
    category: 'bg-yellow-100 text-yellow-800',
    product: 'bg-purple-100 text-purple-800',
    tag: 'bg-pink-100 text-pink-800',
    external: 'bg-gray-100 text-gray-800',
  }
  return colors[type as keyof typeof colors] || colors.custom
}

const getItemTypeLabel = (type: string) => {
  const labels = {
    custom: 'سفارشی',
    page: 'صفحه',
    category: 'دسته‌بندی',
    product: 'محصول',
    tag: 'برچسب',
    external: 'لینک خارجی',
  }
  return labels[type as keyof typeof labels] || type
}

export default function SortableMenuItem({
  item,
  depth,
  onEdit,
  onDelete,
  isDragging = false
}: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingThis,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const indentationStyle = {
    paddingLeft: `${depth * 20}px`,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "opacity-50",
        isDraggingThis && "z-50"
      )}
    >
      <Card 
        className={cn(
          "mb-2 transition-all duration-200",
          isDraggingThis && "shadow-lg ring-2 ring-primary",
          !item.isVisible && "opacity-60"
        )}
        style={indentationStyle}
      >
        <div className="flex items-center gap-3 p-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Depth Indicator */}
          {depth > 0 && (
            <div className="flex items-center text-muted-foreground">
              {Array.from({ length: depth }).map((_, i) => (
                <ChevronRight key={i} className="h-3 w-3" />
              ))}
            </div>
          )}

          {/* Item Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{item.label}</h4>
              <Badge 
                variant="secondary" 
                className={cn("text-xs", getItemTypeColor(item.type))}
              >
                {getItemTypeLabel(item.type)}
              </Badge>
              {!item.isVisible && (
                <Badge variant="outline" className="text-xs">
                  <EyeOff className="h-3 w-3 mr-1" />
                  مخفی
                </Badge>
              )}
            </div>
            
            {item.url && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                <span className="truncate">{item.url}</span>
              </div>
            )}
            
            {item.children.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {item.children.length} زیرمجموعه
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

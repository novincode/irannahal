'use client'

import React, { memo } from 'react'
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
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus
} from 'lucide-react'
import type { MenuItemWithChildren } from '@actions/menu/types'
import { cn } from '@ui/lib/utils'

interface SortableMenuItemProps {
  item: MenuItemWithChildren
  depth: number
  onEdit: (item: MenuItemWithChildren) => void
  onDelete: (itemId: string) => void
  onToggleCollapse?: (itemId: string) => void
  onToggleDropZone?: (itemId: string) => void
  isCollapsed?: boolean
  isDropZoneOpen?: boolean
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

function SortableMenuItem({
  item,
  depth,
  onEdit,
  onDelete,
  onToggleCollapse,
  onToggleDropZone,
  isCollapsed = false,
  isDropZoneOpen = false,
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
    paddingRight: `${depth * 20}px`, // RTL: changed paddingLeft to paddingRight
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
        <div className="flex items-center gap-3 p-3" dir="rtl">
          {/* Collapse/Expand Button for items with children */}
          {item.children.length > 0 && onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCollapse(item.id)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Folder/Item Icon */}
          <div className="text-muted-foreground">
            {item.children.length > 0 ? (
              isCollapsed ? (
                <Folder className="h-4 w-4" />
              ) : (
                <FolderOpen className="h-4 w-4" />
              )
            ) : (
              <div className="h-4 w-4" /> // Spacer for alignment
            )}
          </div>

          {/* Item Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate text-right">{item.label}</h4>
              <Badge 
                variant="secondary" 
                className={cn("text-xs", getItemTypeColor(item.type))}
              >
                {getItemTypeLabel(item.type)}
              </Badge>
              {!item.isVisible && (
                <Badge variant="outline" className="text-xs">
                  <EyeOff className="h-3 w-3 ml-1" />
                  مخفی
                </Badge>
              )}
            </div>
            
            {item.url && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground text-right">
                <ExternalLink className="h-3 w-3" />
                <span className="truncate">{item.url}</span>
              </div>
            )}
            
            {item.children.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {item.children.length} زیرمجموعه
              </div>
            )}
          </div>

          {/* Depth Indicator - moved to right side for RTL */}
          {depth > 0 && (
            <div className="flex items-center text-muted-foreground">
              {Array.from({ length: depth }).map((_, i) => (
                <ChevronRight key={i} className="h-3 w-3" />
              ))}
            </div>
          )}

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
            {onToggleDropZone && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleDropZone(item.id)}
                className={cn(
                  "h-8 w-8 p-0",
                  isDropZoneOpen ? "bg-primary/10 text-primary" : ""
                )}
                title={isDropZoneOpen ? "بستن منطقه رها کردن" : "افزودن زیرمجموعه"}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Drag Handle - moved to the end for RTL */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default memo(SortableMenuItem)

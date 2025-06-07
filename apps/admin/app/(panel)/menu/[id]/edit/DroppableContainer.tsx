'use client'

import React, { useMemo, memo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@ui/lib/utils'
import type { MenuItemWithChildren } from '@actions/menu/types'
import SortableMenuItem from './SortableMenuItem'

interface DroppableContainerProps {
  id: string
  items: MenuItemWithChildren[]
  depth: number
  onEdit: (item: MenuItemWithChildren) => void
  onDelete: (itemId: string) => void
  onToggleCollapse: (itemId: string) => void
  onToggleDropZone?: (itemId: string) => void
  collapsed: Set<string>
  openDropZones?: Set<string>
}

function DroppableContainer({
  id,
  items,
  depth,
  onEdit,
  onDelete,
  onToggleCollapse,
  onToggleDropZone,
  collapsed,
  openDropZones = new Set()
}: DroppableContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  const itemIds = useMemo(() => items.map(item => item.id), [items])

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[60px] transition-all duration-200 rounded-lg",
        isOver && "bg-primary/5 ring-2 ring-primary/20",
        depth === 0 && "p-2",
        depth > 0 && "mr-6 p-2 border-r-2 border-muted" // RTL: changed ml-6 to mr-6, border-l-2 to border-r-2
      )}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id}>
              <SortableMenuItem
                item={item}
                depth={depth}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleCollapse={onToggleCollapse}
                onToggleDropZone={onToggleDropZone}
                isCollapsed={collapsed.has(item.id)}
                isDropZoneOpen={openDropZones?.has(item.id)}
              />
              
              {/* Show drop zone when it's open */}
              {onToggleDropZone && openDropZones?.has(item.id) && (
                <div className="ml-6 my-2">
                  <DroppableContainer
                    id={`drop-zone-${item.id}`}
                    items={[]}
                    depth={depth + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleCollapse={onToggleCollapse}
                    onToggleDropZone={onToggleDropZone}
                    collapsed={collapsed}
                    openDropZones={openDropZones}
                  />
                </div>
              )}
              
              {/* Render children if not collapsed */}
              {item.children.length > 0 && !collapsed.has(item.id) && (
                <DroppableContainer
                  id={`children-${item.id}`}
                  items={item.children}
                  depth={depth + 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleCollapse={onToggleCollapse}
                  onToggleDropZone={onToggleDropZone}
                  collapsed={collapsed}
                  openDropZones={openDropZones}
                />
              )}
            </div>
          ))
        ) : (
          <div
            className={cn(
              "flex items-center justify-center h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg text-muted-foreground text-sm",
              isOver && "border-primary bg-primary/5"
            )}
          >
            {isOver ? 'اینجا رها کنید' : 'آیتم‌ها را اینجا بکشید'}
          </div>
        )}
      </SortableContext>
    </div>
  )
}

export default memo(DroppableContainer)

'use client'

import React from 'react'
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
}

export default function DroppableContainer({
  id,
  items,
  depth,
  onEdit,
  onDelete
}: DroppableContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  const itemIds = items.map(item => item.id)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[60px] transition-all duration-200 rounded-lg",
        isOver && "bg-primary/5 ring-2 ring-primary/20",
        depth === 0 && "p-2",
        depth > 0 && "ml-6 p-2 border-l-2 border-muted"
      )}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {items.length > 0 ? (
          items.map((item) => (
            <SortableMenuItem
              key={item.id}
              item={item}
              depth={depth}
              onEdit={onEdit}
              onDelete={onDelete}
            />
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

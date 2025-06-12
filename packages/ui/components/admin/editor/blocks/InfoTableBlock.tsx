"use client"

import * as React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/components/ui/form"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import { Card, CardContent } from "@ui/components/ui/card"
import { Trash2, Plus, GripVertical } from "lucide-react"
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"


import type { BlockProps } from "@data/usePostEditorStore"

// ==========================================
// TYPES
// ==========================================

export interface InfoTableItem {
  id: string
  key: string
  value: string
}

interface InfoTableBlockProps extends BlockProps {
  disabled?: boolean
}

// ==========================================
// SORTABLE ITEM
// ==========================================

interface SortableInfoItemProps {
  item: InfoTableItem
  onUpdate: (item: InfoTableItem) => void
  onRemove: (id: string) => void
}

function SortableInfoItem({ item, onUpdate, onRemove }: SortableInfoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style} className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-grab active:cursor-grabbing p-1"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          
          <Input
            placeholder="کلید"
            value={item.key}
            onChange={(e) => onUpdate({ ...item, key: e.target.value })}
            className="flex-1"
          />
          
          <Input
            placeholder="مقدار"
            value={item.value}
            onChange={(e) => onUpdate({ ...item, value: e.target.value })}
            className="flex-1"
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function InfoTableBlock({ 
  control, 
  postType, 
  blockId, 
  onUpdate,
  disabled = false
}: InfoTableBlockProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const generateId = () => `info_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return (
    <FormField
      control={control}
      name="infoTable"
      render={({ field }) => {
        const items: InfoTableItem[] = field.value || []

        const handleDragEnd = (event: DragEndEvent) => {
          const { active, over } = event
          if (over && active.id !== over.id) {
            const oldIndex = items.findIndex(item => item.id === active.id)
            const newIndex = items.findIndex(item => item.id === over.id)
            const newItems = arrayMove(items, oldIndex, newIndex)
            field.onChange(newItems)
            onUpdate?.('infoTable', newItems)
          }
        }

        const handleAddItem = () => {
          const newItem: InfoTableItem = {
            id: generateId(),
            key: "",
            value: ""
          }
          const newItems = [...items, newItem]
          field.onChange(newItems)
          onUpdate?.('infoTable', newItems)
        }

        const handleUpdateItem = (updatedItem: InfoTableItem) => {
          const newItems = items.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          )
          field.onChange(newItems)
          onUpdate?.('infoTable', newItems)
        }

        const handleRemoveItem = (id: string) => {
          const newItems = items.filter(item => item.id !== id)
          field.onChange(newItems)
          onUpdate?.('infoTable', newItems)
        }

        return (
          <FormItem>
            <FormLabel>ویژگی‌های محصول</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    {items.map((item) => (
                      <SortableInfoItem
                        key={item.id}
                        item={item}
                        onUpdate={handleUpdateItem}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  disabled={disabled}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  افزودن ویژگی
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

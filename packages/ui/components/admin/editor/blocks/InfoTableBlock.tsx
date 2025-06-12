"use client"

import * as React from "react"
import { usePostEditorStore } from "@data/usePostEditorStore"
import { Button } from "@ui/components/ui/button"
import { Input } from "@ui/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card"
import { GripVertical, Trash2, Plus } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// ==========================================
// TYPES
// ==========================================

interface InfoTableItem {
  id: string
  key: string
  value: string
}

interface InfoTableBlockProps {
  blockId: string
}

// ==========================================
// SORTABLE ITEM
// ==========================================

function SortableInfoItem({ item, onUpdate, onRemove }: {
  item: InfoTableItem
  onUpdate: (item: InfoTableItem) => void
  onRemove: () => void
}) {
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
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-2 items-center">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder="عنوان"
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
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function InfoTableBlock({ blockId }: InfoTableBlockProps) {
  const { updateField, postData } = usePostEditorStore()
  
  const infoTable = (postData.infoTable || []) as InfoTableItem[]

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const updateInfoTable = (newInfoTable: InfoTableItem[]) => {
    updateField("infoTable", newInfoTable)
  }

  const addItem = () => {
    const newItem: InfoTableItem = {
      id: `info-${Date.now()}`,
      key: "",
      value: ""
    }
    updateInfoTable([...infoTable, newItem])
  }

  const updateItem = (index: number, updatedItem: InfoTableItem) => {
    const newInfoTable = [...infoTable]
    newInfoTable[index] = updatedItem
    updateInfoTable(newInfoTable)
  }

  const removeItem = (index: number) => {
    const newInfoTable = infoTable.filter((_, i) => i !== index)
    updateInfoTable(newInfoTable)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = infoTable.findIndex((item) => item.id === active.id)
      const newIndex = infoTable.findIndex((item) => item.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        updateInfoTable(arrayMove(infoTable, oldIndex, newIndex))
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">جدول مشخصات</h3>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          افزودن مشخصه
        </Button>
      </div>

      {infoTable.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={infoTable.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {infoTable.map((item, index) => (
              <SortableInfoItem
                key={item.id}
                item={item}
                onUpdate={(updatedItem) => updateItem(index, updatedItem)}
                onRemove={() => removeItem(index)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {infoTable.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">هیچ مشخصه‌ای اضافه نشده است</p>
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="mt-2"
            >
              افزودن اولین مشخصه
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
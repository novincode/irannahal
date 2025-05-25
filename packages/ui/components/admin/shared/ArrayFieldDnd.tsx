import * as React from "react"
import { useFieldArray, Control, FieldValues, ArrayPath } from "react-hook-form"
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@ui/components/ui/button"

interface ArrayFieldDndProps<T extends FieldValues> {
  control: Control<T>
  name: ArrayPath<T>
  renderItem: (item: any, index: number, fieldProps: {
    remove: () => void
    field: any
    dragHandleProps: React.HTMLAttributes<any>
  }) => React.ReactNode
  getId?: (item: any, index: number) => string
  emptyItem: () => any
  addLabel?: string
  className?: string
}

export function ArrayFieldDnd<T extends FieldValues>({
  control,
  name,
  renderItem,
  getId = (_item, idx) => String(idx),
  emptyItem,
  addLabel = "افزودن",
  className,
}: ArrayFieldDndProps<T>) {
  const { fields, append, remove, move } = useFieldArray({ control, name })
  const sensors = useSensors(useSensor(PointerSensor))

  // Create stable IDs for items that won't change during re-renders
  const itemIds = React.useMemo(() => 
    fields.map((field, index) => getId(field, index)),
    [fields, getId]
  );
    
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return;
    
    const activeId = String(active.id)
    const overId = String(over.id)
    
    // Get indices directly from the current fields array
    const oldIndex = fields.findIndex((f, i) => getId(f, i) === activeId)
    const newIndex = fields.findIndex((f, i) => getId(f, i) === overId)
    
    if (oldIndex !== -1 && newIndex !== -1) {
      // Use react-hook-form's move function to properly update the form state
      move(oldIndex, newIndex)
    }
  }

  return (
    <div className={className}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {fields.map((field, idx) => (
            <SortableItem key={field.id} id={getId(field, idx)}>
              {({ listeners }) => renderItem(field, idx, {
                remove: () => remove(idx),
                field,
                dragHandleProps: { ...listeners, style: { cursor: "grab" }, tabIndex: 0, "aria-label": "Drag handle" },
              })}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="mt-2" 
        onClick={() => append(emptyItem())}
      >
        {addLabel}
      </Button>
    </div>
  )
}

function SortableItem({ id, children }: { id: string, children: (sortableProps: { listeners: any }) => React.ReactNode }) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging,
    isSorting,
    index,
    overIndex
  } = useSortable({ id })
  
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 1,
        position: 'relative',
      }}
      {...attributes}
      data-id={id}
      data-index={index}
    >
      {children({ listeners })}
    </div>
  )
}

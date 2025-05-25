import * as React from "react"
import { PostBlock } from "./PostBlock"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortablePostBlockProps {
  id: string
  title: string
  children: React.ReactNode
  dragHandleProps?: any
}

export function SortablePostBlock({ id, title, children, dragHandleProps }: SortablePostBlockProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging, isOver } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 1,
    position: 'relative' as const,
    outline: isOver ? '2px solid #6366f1' : undefined,
  }
  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <PostBlock id={id} title={title} dragHandleProps={{ ...listeners, ...attributes, ...dragHandleProps }}>
        {children}
      </PostBlock>
    </div>
  )
}

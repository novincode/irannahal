import * as React from "react"
import { PostBlock } from "../PostBlock"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ProductFormWithMetaInput } from "@actions/products/formSchema"
import { renderBlockContent, blockTitles } from "./ProductForm.blocks"

interface SortablePostBlockProps {
  block: any
  column: string
  form: any
  loading: boolean
  submitLabel: string
}

export function SortablePostBlock({ block, column, form, loading, submitLabel }: SortablePostBlockProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging, isOver } = useSortable({ id: block.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 1,
    position: 'relative' as const,
    outline: isOver ? '2px solid #6366f1' : undefined,
  }
  return (
    <div ref={setNodeRef} style={style} className="touch-none ">
      <PostBlock id={block.id} title={blockTitles[block.type]} dragHandleProps={{ ...listeners, ...attributes }}>
        {renderBlockContent(block, form, loading, submitLabel)}
      </PostBlock>
    </div>
  )
}

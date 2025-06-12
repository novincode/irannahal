"use client"

import * as React from "react"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useFormContext } from "react-hook-form"
import { usePostEditorStore } from "@data/usePostEditorStore"
import { getBlock } from "./blockRegistry"
import { SortableBlock } from "./SortableBlock"
import { cn } from "@ui/lib/utils"

// ==========================================
// TYPES
// ==========================================

interface PostEditorColumnProps {
  columnId: 'left' | 'right'
  blocks: Array<{ id: string; blockType: string }>
  className?: string
}

// ==========================================
// COMPONENT
// ==========================================

export function PostEditorColumn({ 
  columnId, 
  blocks, 
  className 
}: PostEditorColumnProps) {
  const form = useFormContext()
  const store = usePostEditorStore()
  
  return (
    <SortableContext
      items={blocks.map(b => b.id)}
      strategy={verticalListSortingStrategy}
    >
      <div className={cn("flex flex-col gap-4", className)}>
        {blocks.map((block) => {
          const blockDefinition = getBlock(block.blockType)
          
          if (!blockDefinition) {
            console.warn(`Block type "${block.blockType}" not found in registry`)
            return null
          }
          
          return (
            <SortableBlock
              key={block.id}
              blockId={block.id}
              blockType={block.blockType}
              title={blockDefinition.title}
              postType={store.postType}
              control={form.control}
              onUpdate={store.updateField}
            >
              <blockDefinition.component 
                control={form.control}
                postType={store.postType}
                blockId={block.id}
                onUpdate={store.updateField}
                {...store.blockProps}
              />
            </SortableBlock>
          )
        })}
      </div>
    </SortableContext>
  )
}

"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardHeader, CardTitle, CardContent } from "@ui/components/ui/card"
import { GripVertical, X } from "lucide-react"
import { Button } from "@ui/components/ui/button"
import { usePostEditorStore } from "@data/usePostEditorStore"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@ui/components/ui/accordion"
import { cn } from "@ui/lib/utils"

// ==========================================
// TYPES
// ==========================================

interface SortableBlockProps {
  blockId: string
  blockType: string
  title: string
  postType: string
  control: any
  onUpdate: (path: string, value: any) => void
  children: React.ReactNode
  defaultOpen?: boolean
}

// ==========================================
// COMPONENT
// ==========================================

export function SortableBlock({
  blockId,
  blockType,
  title,
  postType,
  control,
  onUpdate,
  children,
  defaultOpen = true
}: SortableBlockProps) {
  const store = usePostEditorStore()
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({ id: blockId })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 1,
    position: 'relative' as const,
    outline: isOver ? '2px solid #6366f1' : undefined,
  }
  
  const handleRemove = () => {
    store.removeBlock(blockId)
  }
  
  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <Accordion
        type="single"
        collapsible
        value={isOpen ? blockId : undefined}
        onValueChange={(value) => setIsOpen(!!value)}
      >
        <AccordionItem value={blockId} className="border-none">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2 flex-1">
                {/* Drag Handle */}
                <button
                  type="button"
                  className="text-muted-foreground cursor-grab hover:text-foreground transition-colors p-1"
                  {...listeners}
                  {...attributes}
                  aria-label="Drag block"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
                
                {/* Block Title & Accordion Trigger */}
                <AccordionTrigger className="flex-1 text-left hover:no-underline">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </AccordionTrigger>
              </div>
              
              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </Button>
            </CardHeader>
            
            <AccordionContent>
              <CardContent className="pt-0">
                {children}
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

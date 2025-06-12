"use client"

import * as React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { usePostEditorStore } from "@data/usePostEditorStore"
import { getBlock } from "./blockRegistry"
import { PostEditorColumn } from "./PostEditorColumn"
import { PostEditorToolbar } from "./PostEditorToolbar"
import type { ZodSchema } from "zod"
import { cn } from "@ui/lib/utils"

// ==========================================
// TYPES
// ==========================================

export interface PostEditorProps {
  postType: string
  initialData?: Record<string, any>
  schema?: ZodSchema
  onSubmit?: (data: any) => Promise<void> | void
  onUpdate?: (data: any) => void
  submitLabel?: string
  className?: string
}

// ==========================================
// HOOKS
// ==========================================

function useFormSync(form: any, store: any) {
  // Sync form changes to store
  React.useEffect(() => {
    const subscription = form.watch((value: any) => {
      // Debounce updates to avoid excessive re-renders
      const timeoutId = setTimeout(() => {
        store.updateField('root', value)
      }, 100)
      
      return () => clearTimeout(timeoutId)
    })
    
    return () => subscription.unsubscribe()
  }, [form.watch, store.updateField])
  
  // Sync store changes to form
  React.useEffect(() => {
    const unsubscribe = usePostEditorStore.subscribe(
      (state) => state.postData,
      (postData: any) => {
        form.reset(postData, { keepDirty: true })
      }
    )
    
    return unsubscribe
  }, [form.reset])
}

// ==========================================
// COMPONENT
// ==========================================

export function PostEditor({
  postType,
  initialData = {},
  schema,
  onSubmit,
  onUpdate,
  submitLabel = "ذخیره",
  className
}: PostEditorProps) {
  const store = usePostEditorStore()
  const sensors = useSensors(useSensor(PointerSensor))
  
  // Initialize store on mount
  React.useEffect(() => {
    store.initialize(postType, initialData)
  }, [postType, initialData, store.initialize])
  
  // Setup form with default schema if none provided
  const form = useForm({
    defaultValues: initialData,
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onChange'
  })
  
  // Sync form and store
  useFormSync(form, store)
  
  // Handle form submission
  const handleSubmit = form.handleSubmit(async (data) => {
    store.setSaving(true)
    try {
      await onSubmit?.(data)
      store.markClean()
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      store.setSaving(false)
    }
  })
  
  // Handle updates without submission
  React.useEffect(() => {
    if (onUpdate) {
      const unsubscribe = store.subscribe(
        (state: any) => state.postData,
        (postData: any) => {
          onUpdate(postData)
        }
      )
      
      return unsubscribe
    }
  }, [onUpdate, store.subscribe])
  
  // Handle drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeId = String(active.id)
    const overId = String(over.id)
    
    if (activeId === overId) return
    
    // Find which columns the blocks are in
    const leftBlocks = store.layout.left
    const rightBlocks = store.layout.right
    
    const activeInLeft = leftBlocks.find(b => b.id === activeId)
    const activeInRight = rightBlocks.find(b => b.id === activeId)
    
    const overInLeft = leftBlocks.find(b => b.id === overId)
    const overInRight = rightBlocks.find(b => b.id === overId)
    
    // Determine target column and position
    let targetColumn: 'left' | 'right'
    let targetPosition: number
    
    if (overInLeft) {
      targetColumn = 'left'
      targetPosition = leftBlocks.findIndex(b => b.id === overId)
    } else if (overInRight) {
      targetColumn = 'right'
      targetPosition = rightBlocks.findIndex(b => b.id === overId)
    } else {
      return
    }
    
    // Move the block
    store.moveBlock(activeId, targetColumn, targetPosition)
  }
  
  return (
    <div className={cn("post-editor w-full", className)}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PostEditorToolbar 
            postType={postType}
            submitLabel={submitLabel}
            form={form}
          />
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col md:flex-row-reverse gap-6">
              {/* Left Column */}
              <PostEditorColumn 
                columnId="left"
                blocks={store.layout.left}
                className="md:w-[300px] w-full"
              />
              
              {/* Right Column */}
              <PostEditorColumn 
                columnId="right"
                blocks={store.layout.right}
                className="flex-1"
              />
            </div>
          </DndContext>
        </form>
      </FormProvider>
    </div>
  )
}

// ==========================================
// UTILITIES
// ==========================================

export function createPostEditor(postType: string, defaultSchema?: ZodSchema) {
  return function PostEditorWrapper(props: Omit<PostEditorProps, 'postType' | 'schema'> & { schema?: ZodSchema }) {
    return (
      <PostEditor 
        {...props}
        postType={postType}
        schema={props.schema || defaultSchema}
      />
    )
  }
}

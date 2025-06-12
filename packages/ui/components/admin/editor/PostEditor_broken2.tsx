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
  // Initialize form with store data once
  React.useEffect(() => {
    if (store.postData && Object.keys(store.postData).length > 0) {
      form.reset(store.postData, { keepDefaultValues: true })
    }
  }, [store.postData]) // React to store data changes
  
  // Handle external store updates (like when data is loaded)
  React.useEffect(() => {
    const unsubscribe = store.subscribe?.(
      (state: any) => ({ data: state.postData, isDirty: state.isDirty }),
      (value: any) => {
        // Only update form if it's not currently being edited
        if (!value.isDirty && value.data && Object.keys(value.data).length > 0) {
          form.reset(value.data, { keepDefaultValues: true })
        }
      }
    )
    
    return unsubscribe || (() => {})
  }, [form, store])
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
  }, [postType, initialData])
  
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
    console.log('Form submission started with data:', data)
    console.log('categoryIds type and value:', typeof data.categoryIds, data.categoryIds)
    console.log('tagIds type and value:', typeof data.tagIds, data.tagIds)
    
    store.setSaving(true)
    try {
      await onSubmit?.(data)
      store.markClean()
      console.log('Form submission successful')
    } catch (error) {
      console.error('Failed to save:', error)
      throw error // Re-throw to show user the error
    } finally {
      store.setSaving(false)
    }
  }, (errors) => {
    console.error('Form validation errors:', errors)
    // Log specific field errors
    Object.entries(errors).forEach(([field, error]: [string, any]) => {
      console.error(`Field ${field}:`, error?.message || error)
    })
  })

  // Handle updates without submission
  React.useEffect(() => {
    if (onUpdate) {
      const subscription = form.watch((data) => {
        if (data && Object.keys(data).length > 0) {
          onUpdate(data)
        }
      })
      
      return subscription.unsubscribe
    }
  }, [onUpdate, form])
  
  // Handle drag and drop for blocks
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeId = active.id as string
    const overId = over.id as string
    
    if (activeId === overId) return
    
    // Find which columns the blocks are in
    const activeBlock = store.layout.left.find(b => b.id === activeId) || store.layout.right.find(b => b.id === activeId)
    const overBlock = store.layout.left.find(b => b.id === overId) || store.layout.right.find(b => b.id === overId)
    
    if (!activeBlock || !overBlock) return
    
    // Determine source and target columns
    const sourceColumn = store.layout.left.find(b => b.id === activeId) ? 'left' : 'right'
    const targetColumn = store.layout.left.find(b => b.id === overId) ? 'left' : 'right'
    
    // Find the position in the target column
    const targetBlocks = store.layout[targetColumn]
    const overIndex = targetBlocks.findIndex(b => b.id === overId)
    
    store.moveBlock(activeId, targetColumn, overIndex)
  }
  
  return (
    <div className={cn("post-editor", className)}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">
                <SortableContext 
                  items={store.layout.left.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <PostEditorColumn 
                    columnId="left"
                    blocks={store.layout.left}
                    className="space-y-4"
                  />
                </SortableContext>
              </div>
              
              {/* Right Column */}
              <div className="lg:col-span-2 space-y-6">
                <SortableContext 
                  items={store.layout.right.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <PostEditorColumn 
                    columnId="right"
                    blocks={store.layout.right}
                    className="space-y-4"
                  />
                </SortableContext>
              </div>
            </div>
          </DndContext>
          
          {/* Toolbar */}
          <PostEditorToolbar 
            postType={postType}
            form={form}
            submitLabel={submitLabel}
          />
        </form>
      </FormProvider>
    </div>
  )
}

// ==========================================
// UTILITIES
// ==========================================

export function createPostEditor(config: {
  postType: string
  schema?: ZodSchema
  defaultLayout?: any
}) {
  return function PostEditorComponent(props: Omit<PostEditorProps, 'postType' | 'schema'>) {
    return (
      <PostEditor 
        {...props}
        postType={config.postType}
        schema={config.schema}
      />
    )
  }
}

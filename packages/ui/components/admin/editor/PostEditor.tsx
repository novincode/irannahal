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

function useFormSync(form: any, store: any, initialData: any) {
  const initializedRef = React.useRef(false)
  const savingRef = React.useRef(false)
  const lastSyncedDataRef = React.useRef<any>(null)
  const syncingRef = React.useRef(false) // Prevent infinite loops

  // Track saving state to prevent form resets during save
  React.useEffect(() => {
    savingRef.current = store.isSaving
  }, [store.isSaving])

  // Initialize form with store data once
  React.useEffect(() => {
    if (store.postData && Object.keys(store.postData).length > 0 && !initializedRef.current) {
      console.log('Form sync: Initial form setup with store data')
      console.log('Store data categoryIds:', store.postData.categoryIds)
      console.log('Store data tagIds:', store.postData.tagIds)
      form.reset(store.postData, { keepDefaultValues: true })
      lastSyncedDataRef.current = store.postData
      initializedRef.current = true
    }
  }, [store.postData, form])

  // Handle when new initialData is passed (e.g., after router.refresh)
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Only reset if this is different from what we last synced
      const hasNewData = JSON.stringify(initialData) !== JSON.stringify(lastSyncedDataRef.current)

      if (hasNewData && !savingRef.current && !store.isSaving) {
        console.log('Form sync: New initial data detected, updating form')
        console.log('New initial data categoryIds:', initialData.categoryIds)
        console.log('New initial data tagIds:', initialData.tagIds)
        form.reset(initialData, { keepDefaultValues: true })
        lastSyncedDataRef.current = initialData

        // Also update the store to match
        store.initialize(store.postType, initialData)
      }
    }
  }, [initialData, form, store])

  // Handle external store updates (like when data is loaded)
  React.useEffect(() => {
    const unsubscribe = store.subscribe?.(
      (state: any) => ({ data: state.postData, isDirty: state.isDirty, isSaving: state.isSaving }),
      (value: any) => {
        // NEVER reset form during saving or if currently saving or if we're in a sync operation
        if (savingRef.current || value.isSaving || syncingRef.current) {
          return
        }

        // Only update form if it's not currently being edited and we have clean data
        if (!value.isDirty && value.data && Object.keys(value.data).length > 0) {
          // Check if this data is different from what we last synced
          const hasChanges = JSON.stringify(value.data) !== JSON.stringify(lastSyncedDataRef.current)

          if (hasChanges) {
            console.log('Form sync: Store data changed, updating form')
            syncingRef.current = true
            form.reset(value.data, { keepDefaultValues: true })
            lastSyncedDataRef.current = value.data
            syncingRef.current = false
          }
        }
      }
    )

    return unsubscribe || (() => { })
  }, [form, store])

  // Watch form changes and sync to store
  React.useEffect(() => {
    const subscription = form.watch((data: any) => {
      if (syncingRef.current || !data) return

      // Sync form changes to store
      syncingRef.current = true
      Object.keys(data).forEach(key => {
        if (data[key] !== store.postData[key]) {
          store.updateField(key, data[key])
        }
      })
      syncingRef.current = false
    })

    return subscription.unsubscribe
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

  // Initialize store on mount - use ref to prevent infinite loops
  const initialDataRef = React.useRef(initialData)
  const initializedRef = React.useRef(false)
  const lastPostTypeRef = React.useRef<string>('')

  React.useEffect(() => {
    // Only initialize if:
    // 1. Not already initialized, OR
    // 2. PostType has actually changed to a valid value
    const shouldInitialize = !initializedRef.current || 
      (postType && postType !== lastPostTypeRef.current && postType !== '')
    
    if (shouldInitialize && postType) {
      store.initialize(postType, initialData)
      initializedRef.current = true
      initialDataRef.current = initialData
      lastPostTypeRef.current = postType
    }
  }, [postType, store]) // Only depend on postType and store, not initialData

  // Setup form with default schema if none provided
  const form = useForm({
    defaultValues: initialData,
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onChange'
  })

  // Sync form and store
  useFormSync(form, store, initialData)

  // Handle form submission
  const handleSubmit = form.handleSubmit(async (data) => {
    store.setSaving(true)
    try {
      await onSubmit?.(data)
      store.markClean()
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

  // Don't render if store isn't properly initialized
  if (!store.postType && !postType) {
    return <div className="post-editor-loading">Loading editor...</div>
  }

  return (
    <div className={cn("post-editor", className)} key={`editor-${postType || 'default'}`}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toolbar at top */}
          <PostEditorToolbar
            postType={postType}
            form={form}
            submitLabel={submitLabel}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" >


              {/* Right Column */}
              <div className="lg:col-span-3 space-y-6">
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

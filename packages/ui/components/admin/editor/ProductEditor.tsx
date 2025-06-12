"use client"

import * as React from "react"
import { PostEditor } from "./PostEditor"
import { usePostEditorStore } from "@data/usePostEditorStore"
import { registerProductBlocks, DEFAULT_PRODUCT_LAYOUT } from "./registry/productBlocks"
import { productEditorSchema, type ProductEditorData } from "./schemas/editorSchemas"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"
import type { TagWithDynamicRelations } from "@actions/tags/types"

// ==========================================
// TYPES
// ==========================================

export interface ProductEditorProps {
  initialData?: Partial<ProductEditorData>
  onSubmit?: (data: ProductEditorData) => Promise<void> | void
  onUpdate?: (data: ProductEditorData) => void
  submitLabel?: string
  className?: string
  categories?: CategoryWithDynamicRelations[]
  tags?: TagWithDynamicRelations[]
  allowTagCreate?: boolean
  onCreateTag?: (name: string) => Promise<TagWithDynamicRelations>
  onMediaUpload?: (files: File[]) => Promise<any[]>
  onMediaRemove?: (mediaId: string) => Promise<void>
}

// ==========================================
// COMPONENT
// ==========================================

export function ProductEditor({
  initialData = {},
  onSubmit,
  onUpdate,
  submitLabel = "ذخیره محصول",
  className,
  categories = [],
  tags = [],
  allowTagCreate = false,
  onCreateTag,
  onMediaUpload,
  onMediaRemove
}: ProductEditorProps) {
  const store = usePostEditorStore()
  
  // Register blocks and set default layout on first mount
  React.useEffect(() => {
    registerProductBlocks()
    
    // Set default layout if not already set
    if (store.layout.left.length === 0 && store.layout.right.length === 0) {
      store.setLayout(DEFAULT_PRODUCT_LAYOUT)
    }
  }, [])
  
  // Inject additional props into blocks
  React.useEffect(() => {
    store.setBlockProps({
      categories,
      tags,
      allowTagCreate,
      onCreateTag,
      onMediaUpload,
      onMediaRemove,
      submitLabel,
      isLoading: store.isSaving
    })
  }, [categories, tags, allowTagCreate, onCreateTag, onMediaUpload, onMediaRemove, submitLabel, store.isSaving])
  
  const handleSubmit = async (data: ProductEditorData) => {
    try {
      await onSubmit?.(data)
    } catch (error) {
      console.error('Product save failed:', error)
      throw error
    }
  }

  return (
    <PostEditor
      postType="product"
      initialData={initialData}
      schema={productEditorSchema}
      onSubmit={handleSubmit}
      onUpdate={onUpdate}
      submitLabel={submitLabel}
      className={className}
    />
  )
}

// ==========================================
// CONVENIENCE HOOK
// ==========================================

export function useProductEditor() {
  const store = usePostEditorStore()
  
  const reset = React.useCallback(() => {
    store.resetForm()
  }, [store.resetForm])
  
  const setData = React.useCallback((data: Partial<ProductEditorData>) => {
    Object.entries(data).forEach(([key, value]) => {
      store.updateField(key, value)
    })
  }, [store.updateField])
  
  const getData = React.useCallback((): ProductEditorData => {
    return store.postData as ProductEditorData
  }, [store.postData])
  
  return {
    data: store.postData as ProductEditorData,
    isDirty: store.isDirty,
    isLoading: store.isLoading,
    isSaving: store.isSaving,
    layout: store.layout,
    reset,
    setData,
    getData,
    addBlock: store.addBlock,
    removeBlock: store.removeBlock,
    moveBlock: store.moveBlock
  }
}

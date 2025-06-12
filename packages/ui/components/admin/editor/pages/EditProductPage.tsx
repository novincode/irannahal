"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ProductEditor } from "../ProductEditor"
import { updateProductAction } from "@actions/products/update"
import { metaRowsToObject } from "@actions/meta/utils"
import { toast } from "sonner"
import type { ProductWithDynamicRelations } from "@actions/products/types"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"
import type { TagWithDynamicRelations } from "@actions/tags/types"
import type { ProductEditorData } from "@ui/components/admin/editor/schemas/editorSchemas"

// ==========================================
// TYPES
// ==========================================

interface EditProductPageProps {
  product: ProductWithDynamicRelations<{
    categories: true
    tags: true
    media: true
    thumbnail: true
    meta: true
    downloads: true
  }>
  categoriesData?: CategoryWithDynamicRelations[]
  tagsData?: TagWithDynamicRelations[]
  className?: string
}

// ==========================================
// COMPONENT
// ==========================================

export function EditProductPage({
  product,
  categoriesData = [],
  tagsData = [],
  className
}: EditProductPageProps) {
  const router = useRouter()

  const blockProps = React.useMemo(() => ({
    categoriesData,
    tagsData,
    onCreateTag: async (name: string) => {
      // Use the real createTag action to create a proper tag with UUID
      const { createTag } = await import("@actions/tags/create")
      const newTag = await createTag({ 
        name: name.trim(), 
        slug: name.trim().toLowerCase().replace(/\s+/g, "-") 
      })
      console.log("Created tag:", newTag)
      return newTag
    }
  }), [categoriesData, tagsData])

  // Transform product data to match form schema
  const initialData = React.useMemo(() => {
    console.log('=== DEBUGGING EDIT PRODUCT PAGE ===')
    console.log('Raw product data:', product)
    console.log('Product categories:', product.categories)
    console.log('Product tags:', product.tags)
    
    // Extract category and tag IDs carefully
    const categoryIds = Array.isArray(product.categories) 
      ? product.categories.map((c) => c.id).filter(Boolean) 
      : []
    const tagIds = Array.isArray(product.tags) 
      ? product.tags.map((t) => t.id).filter(Boolean) 
      : []
    
    console.log('Extracted categoryIds:', categoryIds)
    console.log('Extracted tagIds:', tagIds)
    
    const data = {
      // Basic fields
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: product.price || 0,
      
      // Status fields
      status: product.status || "draft",
      
      // Relations - ensure arrays are never undefined and filter out invalid IDs
      categoryIds,
      tagIds,
      
      // Media
      thumbnailId: product.thumbnailId || undefined,
      mediaIds: Array.isArray(product.media) ? product.media.map((m) => m.id) : [],
      
      // Meta and complex fields
      meta: product.meta ? metaRowsToObject(product.meta) : {},
      infoTable: [], // This would come from meta if stored there
      downloads: Array.isArray(product.downloads) ? product.downloads.map(d => ({
        id: d.id,
        name: d.url.split('/').pop() || 'Download', // Extract filename from URL
        url: d.url,
        type: d.type || 'file' as const,
        maxDownloads: 0,
        description: undefined,
        size: undefined,
        format: d.type
      })) : [],
      
      // Content
      content: product.content || "",
    }
    
    console.log('EditProductPage initialData:', data)
    return data
  }, [product])

  const handleSave = async (formData: any) => {
    try {
      console.log('Saving product with data:', formData)
      const result = await updateProductAction({ ...formData, id: product.id })
      console.log('Product updated successfully:', result)
      
      // Refresh the page to get updated data
      router.refresh()
      
      // Show success message
      toast.success("محصول با موفقیت به‌روزرسانی شد")
    } catch (error) {
      console.error("Failed to update product:", error)
      toast.error("خطا در به‌روزرسانی محصول")
      throw error
    }
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ویرایش محصول</h1>
        <p className="text-gray-600 mt-1">
          جزئیات محصول &quot;{product.name}&quot; را ویرایش کنید
        </p>
      </div>

      <ProductEditor
        initialData={initialData}
        onSubmit={handleSave}
        categories={categoriesData}
        tags={tagsData}
        onCreateTag={blockProps.onCreateTag}
        submitLabel="به‌روزرسانی محصول"
      />
    </div>
  )
}

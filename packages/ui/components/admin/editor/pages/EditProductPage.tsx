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
      // Implement tag creation logic here
      console.log("Creating tag:", name)
      return {
        id: `tag-${Date.now()}`,
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, "-")
      }
    }
  }), [categoriesData, tagsData])

  // Transform product data to match form schema
  const initialData = React.useMemo(() => {
    return {
      // Basic fields
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: product.price || 0,
      
      // Status fields
      status: product.status || "draft",
      
      // Relations - safely handle with proper types
      categoryIds: product.categories?.map((c) => c.id) || [],
      tagIds: product.tags?.map((t) => t.id) || [],
      
      // Media
      thumbnailId: product.thumbnailId || undefined,
      mediaIds: product.media?.map((m) => m.id) || [],
      
      // Meta and complex fields
      meta: product.meta ? metaRowsToObject(product.meta) : {},
      infoTable: [], // This would come from meta if stored there
      downloads: product.downloads?.map(d => ({
        id: d.id,
        name: d.url.split('/').pop() || 'Download', // Extract filename from URL
        url: d.url,
        description: undefined,
        size: undefined,
        format: d.type
      })) || [],
      
      // Timestamps - only include ones that exist on ProductSchema
      createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
      updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    }
  }, [product])

  const handleSave = async (formData: any) => {
    try {
      await updateProductAction({ ...formData, id: product.id })
      router.refresh()
    } catch (error) {
      console.error("Failed to update product:", error)
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

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ProductEditor } from "../ProductEditor"
import { createProduct } from "@actions/products/create"
import { toast } from "sonner"
import type { ProductEditorData } from "@ui/components/admin/editor/schemas/editorSchemas"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"
import type { TagWithDynamicRelations } from "@actions/tags/types"

// ==========================================
// TYPES
// ==========================================

interface NewProductPageProps {
  categoriesData?: CategoryWithDynamicRelations[]
  tagsData?: TagWithDynamicRelations[]
  className?: string
}

// ==========================================
// COMPONENT
// ==========================================

export function NewProductPage({
  categoriesData = [],
  tagsData = [],
  className
}: NewProductPageProps) {
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

  const handleSave = async (formData: ProductEditorData) => {
    try {
      // Transform editor data to backend format
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        content: formData.content || '',
        status: formData.status,
        price: formData.price,
        isDownloadable: false, // Set based on downloads
        categoryIds: formData.categoryIds,
        tagIds: formData.tagIds,
        thumbnailId: formData.thumbnailId,
        mediaIds: formData.mediaIds,
        meta: formData.meta,
        downloads: formData.downloads?.map(download => ({
          ...download,
          type: download.type || 'file' as const,
          maxDownloads: download.maxDownloads || 0
        })),
        infoTable: formData.infoTable
      }
      
      await createProduct(productData)
      toast.success("محصول با موفقیت ایجاد شد")
      router.push("/admin/products")
    } catch (error) {
      console.error("Failed to create product:", error)
      toast.error("خطا در ایجاد محصول")
      throw error
    }
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">محصول جدید</h1>
        <p className="text-gray-600 mt-1">
          یک محصول جدید ایجاد کنید و جزئیات آن را تنظیم کنید
        </p>
      </div>

      <ProductEditor
        onSubmit={handleSave}
        categories={categoriesData}
        tags={tagsData}
        onCreateTag={blockProps.onCreateTag}
        submitLabel="ایجاد محصول"
      />
    </div>
  )
}

"use client"

import * as React from "react"
import { ProductEditor } from "@ui/components/admin/editor/ProductEditor"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card"
import { Button } from "@ui/components/ui/button"
import { ArrowLeft, Save, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { ProductEditorData } from "@ui/components/admin/editor/schemas/editorSchemas"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"
import type { TagWithDynamicRelations } from "@actions/tags/types"

// ==========================================
// TYPES
// ==========================================

interface NewProductPageProps {
  categories?: CategoryWithDynamicRelations[]
  tags?: TagWithDynamicRelations[]
}

// ==========================================
// COMPONENT
// ==========================================

export function NewProductPage({ 
  categories = [], 
  tags = [] 
}: NewProductPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  
  const handleSubmit = async (data: ProductEditorData) => {
    setIsLoading(true)
    
    try {
      // TODO: Replace with actual product creation action
      console.log('Creating product:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("محصول با موفقیت ایجاد شد")
      
      // Redirect to products list or edit page
      router.push('/admin/products')
      
    } catch (error) {
      console.error('Failed to create product:', error)
      toast.error("خطا در ایجاد محصول. لطفاً دوباره تلاش کنید.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCreateTag = async (name: string): Promise<TagWithDynamicRelations> => {
    try {
      // TODO: Replace with actual tag creation action
      console.log('Creating tag:', name)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newTag: TagWithDynamicRelations = {
        id: Date.now().toString(),
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-')
      }
      
      toast.success("برچسب جدید ایجاد شد")
      
      return newTag
    } catch (error) {
      console.error('Failed to create tag:', error)
      toast.error("خطا در ایجاد برچسب. لطفاً دوباره تلاش کنید.")
      throw error
    }
  }
  
  const handleMediaUpload = async (files: File[]): Promise<any[]> => {
    try {
      // TODO: Replace with actual media upload action
      console.log('Uploading files:', files)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock uploaded media objects
      const uploadedMedia = files.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
      
      toast.success(`${files.length} فایل با موفقیت آپلود شد`)
      
      return uploadedMedia
    } catch (error) {
      console.error('Failed to upload media:', error)
      toast.error("خطا در آپلود فایل. لطفاً دوباره تلاش کنید.")
      throw error
    }
  }
  
  const handleMediaRemove = async (mediaId: string): Promise<void> => {
    try {
      // TODO: Replace with actual media removal action
      console.log('Removing media:', mediaId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      toast.success("فایل با موفقیت حذف شد")
    } catch (error) {
      console.error('Failed to remove media:', error)
      toast.error("خطا در حذف فایل. لطفاً دوباره تلاش کنید.")
      throw error
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                بازگشت
              </Button>
              <CardTitle>افزودن محصول جدید</CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                بازنشانی
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Product Editor */}
      <ProductEditor
        onSubmit={handleSubmit}
        submitLabel={isLoading ? "در حال ایجاد..." : "ایجاد محصول"}
        categories={categories}
        tags={tags}
        allowTagCreate={true}
        onCreateTag={handleCreateTag}
        onMediaUpload={handleMediaUpload}
        onMediaRemove={handleMediaRemove}
        initialData={{
          name: '',
          slug: '',
          description: '',
          status: 'draft',
          price: 0,
          categoryIds: [],
          tagIds: [],
          meta: {},
          infoTable: [],
          downloads: []
        }}
      />
    </div>
  )
}

"use client"

import * as React from "react"
import { ProductEditor } from "@ui/components/admin/editor/ProductEditor"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card"
import { Button } from "@ui/components/ui/button"
import { Badge } from "@ui/components/ui/badge"
import { ArrowLeft, Save, RefreshCw, Eye, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { ProductEditorData } from "@ui/components/admin/editor/schemas/editorSchemas"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"
import type { TagWithDynamicRelations } from "@actions/tags/types"
import type { ProductWithDynamicRelations } from "@actions/products/types"

// ==========================================
// TYPES
// ==========================================

interface EditProductPageProps {
  product: ProductWithDynamicRelations
  categories?: CategoryWithDynamicRelations[]
  tags?: TagWithDynamicRelations[]
}

// ==========================================
// COMPONENT
// ==========================================

export function EditProductPage({ 
  product,
  categories = [], 
  tags = [] 
}: EditProductPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isDirty, setIsDirty] = React.useState(false)
  
  // Transform product data to editor format
  const initialData = React.useMemo((): Partial<ProductEditorData> => {
    return {
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      content: product.content || '',
      status: product.status || 'draft',
      price: product.price || 0,
      categoryIds: Array.isArray((product as any).categories) 
        ? (product as any).categories.map((c: any) => typeof c === 'object' ? c.category?.id || c.id : c)
        : [],
      tagIds: Array.isArray((product as any).tags)
        ? (product as any).tags.map((t: any) => typeof t === 'object' ? t.tag?.id || t.id : t)
        : [],
      thumbnailId: (product as any).thumbnail && typeof (product as any).thumbnail === 'object' 
        ? (product as any).thumbnail.id 
        : (product as any).thumbnail || null,
      mediaIds: Array.isArray((product as any).media)
        ? (product as any).media.map((m: any) => typeof m === 'object' ? m.id : m)
        : [],
      meta: (product as any).meta && typeof (product as any).meta === 'object' ? (product as any).meta : {},
      infoTable: (product as any).infoTable || [],
      downloads: (product as any).downloads || []
    }
  }, [product])
  
  const handleSubmit = async (data: ProductEditorData) => {
    setIsLoading(true)
    
    try {
      // TODO: Replace with actual product update action
      console.log('Updating product:', { id: product.id, ...data })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("محصول با موفقیت به‌روزرسانی شد")
      
      setIsDirty(false)
      
    } catch (error) {
      console.error('Failed to update product:', error)
      toast.error("خطا در به‌روزرسانی محصول. لطفاً دوباره تلاش کنید.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleUpdate = (data: ProductEditorData) => {
    setIsDirty(true)
  }
  
  const handleDelete = async () => {
    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      return
    }
    
    try {
      // TODO: Replace with actual product deletion action
      console.log('Deleting product:', product.id)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success("محصول با موفقیت حذف شد")
      
      router.push('/admin/products')
      
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error("خطا در حذف محصول. لطفاً دوباره تلاش کنید.")
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

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      active: 'default',
      inactive: 'destructive',
      out_of_stock: 'outline'
    } as const
    
    const labels = {
      draft: 'پیش‌نویس',
      active: 'فعال',
      inactive: 'غیرفعال',
      out_of_stock: 'ناموجود'
    }
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
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
              <div>
                <CardTitle className="flex items-center gap-3">
                  ویرایش محصول: {product.name}
                  {getStatusBadge(product.status)}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  آخرین ویرایش: {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('fa-IR') : 'نامعلوم'}
                  {isDirty && <span className="text-orange-600 mr-2">• تغییرات ذخیره نشده</span>}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/products/${product.slug}`, '_blank')}
              >
                <Eye className="w-4 h-4 ml-2" />
                مشاهده
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                بازنشانی
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Product Editor */}
      <ProductEditor
        initialData={initialData}
        onSubmit={handleSubmit}
        onUpdate={handleUpdate}
        submitLabel={isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
        categories={categories}
        tags={tags}
        allowTagCreate={true}
        onCreateTag={handleCreateTag}
        onMediaUpload={handleMediaUpload}
        onMediaRemove={handleMediaRemove}
      />
    </div>
  )
}

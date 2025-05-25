"use client"
import { ProductForm } from '@ui/components/admin/products/ProductForm'
import type { ProductWithDynamicRelations } from '@actions/products/types';
import { updateProduct } from '@actions/products/update'
import type { UpdateProductInput } from '@actions/products/formSchema';
import { toast } from "sonner"

export type EditProductClientProps = {
  initialData: ProductWithDynamicRelations<{ tags: true; categories: true; downloads: true; media: true; meta: true; thumbnail: true }>
  productId: string
}

export default function EditProductClient({ initialData, productId }: EditProductClientProps) {
  const handleSubmit = async (data: UpdateProductInput) => {
    try {
      await updateProduct({ ...data, id: productId })
      toast.success("محصول با موفقیت ویرایش شد.")
    } catch (err) {
      // Log error for debugging
      console.error('Product update failed:', err)
      toast.error('خطا در ویرایش محصول. لطفا مجددا تلاش کنید.')
    }
  }
  return <ProductForm initialData={initialData} onSubmit={handleSubmit} submitLabel="ویرایش محصول" />
}

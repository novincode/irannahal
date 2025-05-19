"use client"
import { ProductForm } from '@ui/components/admin/products/ProductForm'
import { ProductFormInput } from '@actions/products/formSchema'
import { updateProduct } from '@actions/products/update'

export type EditProductClientProps = {
  initialData: Partial<ProductFormInput>
  productId: string
}

export default function EditProductClient({ initialData, productId }: EditProductClientProps) {
  const handleSubmit = async (data: ProductFormInput) => {
    await updateProduct({ ...data, id: productId })
  }
  return <ProductForm initialData={initialData} onSubmit={handleSubmit} submitLabel="ویرایش محصول" />
}

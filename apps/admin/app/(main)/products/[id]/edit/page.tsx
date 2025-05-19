import React from 'react'
import { ProductFormInput } from '@actions/products/formSchema'
import { getProduct } from '@actions/products/get'
import EditProductClient from './EditProductClient'

// Server Component
const EditProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return <div>محصول پیدا نشد</div>

  // Fix: convert null fields to undefined for form compatibility
  const initialData = {
    ...product,
    description: product.description ?? undefined,
    content: product.content ?? undefined,
    // Add other nullable fields if needed
  }

  return <EditProductClient initialData={initialData} productId={id} />
}

export default EditProductPage
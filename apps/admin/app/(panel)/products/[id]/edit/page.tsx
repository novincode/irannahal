import React from 'react'
import { ProductFormInput } from '@actions/products/formSchema'
import { getProduct } from '@actions/products/get'
import EditProductClient from './EditProductClient'
import { metaRowsToObject } from "@actions/meta/utils"

// Server Component
const EditProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const product = await getProduct(id, {with: {
    media: true,
    meta: true,
    downloads: true,
  }})
  
  if (!product) return <div>محصول پیدا نشد</div>

  // Transform meta array to nested object for form compatibility
  const initialData = {
    ...product,
    meta: Array.isArray(product.meta)
      ? metaRowsToObject(product.meta.filter(r => r.value !== null).map(({ key, value }) => ({ key, value: value as string })))
      : {},
    description: product.description ?? undefined,
    content: product.content ?? undefined,
    thumbnailId: product.thumbnailId ?? undefined,
    // Add other nullable fields if needed
  }

  return <EditProductClient initialData={initialData} productId={id} />
}

export default EditProductPage
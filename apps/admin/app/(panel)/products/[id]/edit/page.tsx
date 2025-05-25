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
    tags: true,
    categories: true,
    thumbnail: true,
  }})
  
  if (!product) return <div>محصول پیدا نشد</div>

  return <EditProductClient initialData={product} productId={id} />
}

export default EditProductPage
import React from 'react'
import { getProduct } from '@actions/products/get'
import { EditProductPage } from "@ui/components/admin/editor/pages/EditProductPage"
import { getCategories } from "@actions/categories/get"
import { getTags } from "@actions/tags/get"

// Server Component
const EditProductServerPage = async ({ params }: { params: Promise<{ id: string }> }) => {
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

  // Get categories and tags for the editor
  const categories = await getCategories({ with: {} })
  const tags = await getTags({ with: {} })

  return <EditProductPage product={product} categoriesData={categories} tagsData={tags} />
}

export default EditProductServerPage
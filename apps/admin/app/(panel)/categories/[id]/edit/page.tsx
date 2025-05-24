import React from 'react'
import { CategoryFormInput } from '@actions/categories/formSchema'
import { getCategory, getCategories } from '@actions/categories/get'
import EditCategoryClient from './EditCategoryClient'

// Server Component
const EditCategoryPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const category = await getCategory(id)
  const allCategories = await getCategories()

  if (!category) return <div>دسته‌بندی پیدا نشد</div>

  // Exclude self from parent options
  const parentOptions = allCategories
    .filter((cat) => cat.id !== id)
    .map((cat) => ({ value: cat.id, label: cat.name }))

  // Fix: convert null fields to undefined for form compatibility
  const initialData: CategoryFormInput = {
    ...category,
    parentId: category.parentId ?? undefined,
    name: category.name ?? "",
    slug: category.slug ?? "",
  }

  return <EditCategoryClient initialData={initialData} categoryId={id} parentOptions={parentOptions} />
}

export default EditCategoryPage

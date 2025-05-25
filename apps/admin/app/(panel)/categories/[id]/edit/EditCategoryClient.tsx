"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CategoryForm } from "@ui/components/admin/categories/CategoryForm"
import { updateCategory } from "@actions/categories/update"
import { CategoryFormInput } from "@actions/categories/formSchema"

interface EditCategoryClientProps {
  initialData: CategoryFormInput
  categoryId: string
  parentOptions: { value: string; label: string }[]
}

export default function EditCategoryClient({ initialData, categoryId, parentOptions }: EditCategoryClientProps) {
  const router = useRouter()
  const handleSubmit = async (data: CategoryFormInput) => {
    await updateCategory({ ...data, id: categoryId })
    // Optionally, show notification or redirect
  }
  return (
    <CategoryForm
      initialData={initialData}
      onSubmit={handleSubmit}
      parentOptions={parentOptions}
      submitLabel="ویرایش دسته‌بندی"
      isEditing={true}
    />
  )
}

'use client'
import React from "react"
import { CategoryForm } from "@ui/components/admin/categories/CategoryForm"
import { createCategory } from "@actions/categories/create"
import { CategoryFormInput } from "@actions/categories/formSchema"
import { useRouter } from 'next/navigation'

const Page = () => {
  const router = useRouter()
  const handleSubmit = async (data: CategoryFormInput) => {
    const category = await createCategory(data)
    if (category?.id) {
      router.push(`/categories/${category.id}/edit`)
    }
    // Optionally, add notification here
  }
  return <CategoryForm onSubmit={handleSubmit} />
}

export default Page

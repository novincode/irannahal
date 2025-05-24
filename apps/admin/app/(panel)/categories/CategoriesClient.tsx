"use client"
import * as React from "react"
import { CategoryForm, CategoryFormHandle } from "@ui/components/admin/categories/CategoryForm"
import CategoriesDataTable from "@ui/components/admin/categories/CategoriesDataTable"
import { createCategory } from "@actions/categories/create"
import { getCategories } from "@actions/categories/get"
import { CategoryFormInput } from "@actions/categories/formSchema"
import { CategorySchema as Category } from "@db/types"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"

export default function CategoriesClient({ initialCategories }: { initialCategories: CategoryWithDynamicRelations<{ parent: true }>[] }) {
  const [categories, setCategories] = React.useState<CategoryWithDynamicRelations<{ parent: true }>[]>(initialCategories)
  const [loading, setLoading] = React.useState(false)
  const formRef = React.useRef<CategoryFormHandle>(null)

  const handleCreate = async (data: CategoryFormInput) => {
    setLoading(true)
    try {
      const newCategory = await createCategory(data)
      if (newCategory?.id) {
        const updated = await getCategories({ with: { parent: true } })
        setCategories(updated)
        formRef.current?.reset()
      }
    } finally {
      setLoading(false)
    }
  }

  // Prepare parent options (exclude self, but for create, just use all)
  const parentOptions = categories.map(cat => ({ value: cat.id, label: cat.name }))

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3 w-full">
        <CategoryForm ref={formRef} onSubmit={handleCreate} parentOptions={parentOptions} submitLabel={loading ? "در حال ثبت..." : "افزودن دسته‌بندی"} />
      </div>
      <div className="md:w-2/3 w-full">
        <CategoriesDataTable data={categories} />
      </div>
    </div>
  )
}

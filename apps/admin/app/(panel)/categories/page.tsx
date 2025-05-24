import React from 'react'
import { getCategories } from "@actions/categories/get"
import CategoriesClient from "./CategoriesClient"
import type { CategoryWithDynamicRelations } from "@actions/categories/types"

const page = async () => {
  const categories: CategoryWithDynamicRelations<{ parent: true }>[] = await getCategories({
    with: { parent: true }
  })
  return <CategoriesClient initialCategories={categories} />
}

export default page

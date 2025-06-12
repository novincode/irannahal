import React from "react"
import { NewProductPage } from "@ui/components/admin/editor/pages/NewProductPage"
import { getCategories } from "@actions/categories/get"
import { getTags } from "@actions/tags/get"

const Page = async () => {
  // Get categories and tags for the editor
  const categories = await getCategories({ with: {} })
  const tags = await getTags({ with: {} })

  return <NewProductPage categoriesData={categories} tagsData={tags} />
}

export default Page
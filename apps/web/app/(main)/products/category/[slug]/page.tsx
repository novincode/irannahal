import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getProductsByCategory, getAvailableFilters } from "@actions/products/get"
import { getCategoryBySlug } from "@actions/categories/get"
import { urlUtils } from "@actions/products/urlUtils"
import { CategoryArchivePage } from "@ui/components/products/CategoryArchivePage"
import { Metadata } from 'next'

interface CategoryArchivePageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: CategoryArchivePageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  
  if (!category) {
    return {
      title: 'دسته‌بندی یافت نشد'
    }
  }

  return {
    title: `${category.name} | دسته‌بندی محصولات | نهالتو`,
    description: `مشاهده و خرید محصولات در دسته‌بندی ${category.name} با امکان فیلتر بر اساس قیمت و ویژگی‌های مختلف`,
  }
}

export default async function CategoryArchive({ params, searchParams }: CategoryArchivePageProps) {
  // Await params first
  const { slug } = await params
  
  // Get category first
  const category = await getCategoryBySlug(slug)
  
  if (!category) {
    notFound()
  }

  // Await searchParams
  const searchParamsResolved = await searchParams

  // Convert Next.js searchParams to URLSearchParams
  const urlSearchParams = new URLSearchParams()
  Object.entries(searchParamsResolved).forEach(([key, value]) => {
    if (value) {
      const valueStr = Array.isArray(value) ? value[0] : value
      urlSearchParams.set(key, valueStr)
    }
  })

  // Parse filters from URL
  const currentFilters = urlUtils.parseFiltersFromURL(urlSearchParams)
  
  // Add category to filters
  const filtersWithCategory = {
    ...currentFilters,
    categories: [category.id]
  }

  // Fetch data in parallel
  const [archiveResult, availableFilters] = await Promise.all([
    getProductsByCategory({ categorySlug: slug, filters: currentFilters }),
    getAvailableFilters(filtersWithCategory)
  ])

  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <CategoryArchivePage
        category={category}
        archiveResult={archiveResult}
        availableFilters={availableFilters}
        currentFilters={currentFilters}
      />
    </Suspense>
  )
}

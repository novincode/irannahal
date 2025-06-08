import { Suspense } from 'react'
import { getProductsArchive, getAvailableFilters } from "@actions/products/get"
import { urlUtils } from "@actions/products/urlUtils"
import { ProductsArchive } from "@ui/components/products/ProductsArchive"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'محصولات | نهالتو',
  description: 'مشاهده و خرید محصولات با امکان فیلتر بر اساس دسته‌بندی، قیمت و ویژگی‌های مختلف',
}

interface ProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Convert Next.js searchParams to URLSearchParams
  const urlSearchParams = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      const valueStr = Array.isArray(value) ? value[0] : value
      urlSearchParams.set(key, valueStr)
    }
  })

  // Parse filters from URL
  const currentFilters = urlUtils.parseFiltersFromURL(urlSearchParams)

  // Fetch data in parallel
  const [archiveResult, availableFilters] = await Promise.all([
    getProductsArchive(currentFilters),
    getAvailableFilters(currentFilters)
  ])

  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <ProductsArchive
        archiveResult={archiveResult}
        availableFilters={availableFilters}
        currentFilters={currentFilters}
        basePath="/products"
        title="محصولات"
        description="مشاهده و خرید محصولات متنوع با امکان فیلتر و جستجو"
      />
    </Suspense>
  )
}
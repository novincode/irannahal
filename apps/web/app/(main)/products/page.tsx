import { getProducts } from "@actions/products/get"
import { ProductArchive } from "@ui/components/products/ProductArchive"

export default async function ProductArchivePage() {
  const products = await getProducts({ with: { thumbnail: true } })
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">محصولات</h1>
      <ProductArchive products={products} />
    </div>
  )
}
import type { ProductWithDynamicRelations } from "@actions/products/types"
import { ProductCard } from "./ProductCard"

interface ProductArchiveProps {
  products: ProductWithDynamicRelations<{ thumbnail: true }>[]
}

export function ProductArchive({ products }: ProductArchiveProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

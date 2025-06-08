import type { ProductWithDynamicRelations } from "@actions/products/types"
import { ProductCard } from "./ProductCard"
import { ProductListItem } from "./ProductListItem"

interface ProductArchiveProps {
  products: ProductWithDynamicRelations<{ thumbnail: true }>[]
  viewMode?: 'grid' | 'list'
}

export function ProductArchive({ products, viewMode = 'grid' }: ProductArchiveProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map(product => (
          <ProductListItem key={product.id} product={product} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

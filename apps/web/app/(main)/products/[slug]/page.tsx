import { getProductBySlug } from "@actions/products/get"
import { ProductSingle } from "@ui/components/products/ProductSingle"
import { notFound } from "next/navigation"

interface ProductSinglePageProps {
    params: { slug: string }
}

export default async function ProductSinglePage({ params }: ProductSinglePageProps) {
    const product = await getProductBySlug(params.slug, { 
        with: { 
            thumbnail: true,
            meta: true 
        } 
    })
    
    if (!product) return notFound()
    
    return (
        <ProductSingle product={product} />
    )
}

import { getProductBySlug } from "@actions/products/get"
import { ProductSingle } from "@ui/components/products/ProductSingle"
import { notFound } from "next/navigation"

interface ProductSinglePageProps {
    params: Promise<{ slug: string }>
}

export default async function ProductSinglePage({ params }: ProductSinglePageProps) {
    // Await params first
    const { slug } = await params
    
    // Decode the slug to handle Persian/Arabic characters
    const product = await getProductBySlug(slug, { 
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

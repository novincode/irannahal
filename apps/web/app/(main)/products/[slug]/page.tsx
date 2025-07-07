
import { getProductBySlug } from "@actions/products/get"
import { ProductSingle } from "@ui/components/products/ProductSingle"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { cachedGetAllSettings } from "@actions/settings"
import { SETTING_KEYS } from "@actions/settings/types"


interface ProductSinglePageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductSinglePageProps): Promise<Metadata> {
        const { slug } = await params
        const product = await getProductBySlug(slug)
        if (!product) {
            return {
                title: "محصول پیدا نشد | فروشگاه",
                description: "این محصول وجود ندارد یا حذف شده است."
            }
        }
        const title = product.name || "محصول فروشگاه"
        const description = product.description || `خرید ${product.name} با بهترین قیمت از فروشگاه ما.`
        const images = product.thumbnail?.url ? [product.thumbnail.url] : []
        const price = product.price ? `${product.price.toLocaleString()} تومان` : undefined
        // Try to get site name from cached settings
        let siteName = "فروشگاه آنلاین"
        try {
            const settings = await cachedGetAllSettings()
            siteName = settings[SETTING_KEYS.SITE_TITLE] || siteName
        } catch {}
        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images,
                type: "website",
                locale: "fa_IR",
                siteName,
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images,
            },
            alternates: {
                canonical: `/products/${slug}`
            },
            other: {
                ...(price ? { "product:price:amount": product.price, "product:price:currency": "IRR" } : {})
            }
        }
}

export default async function ProductSinglePage({ params }: ProductSinglePageProps) {
    const { slug } = await params
    const product = await getProductBySlug(slug)
    if (!product) return notFound()
    return <ProductSingle product={product} />
}

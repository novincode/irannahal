'use server'
import { db } from "@db"
import { products, productCategories, productTags, media, downloads } from "@db/schema"
import { productFormSchema, ProductFormInput } from "./formSchema"
import { withRole } from "@actions/utils"
import { inArray } from "drizzle-orm"
import type { UserSchema } from "@db/types"

export const createProduct = withRole(["admin", "author"])(async (user: UserSchema, data: ProductFormInput) => {
  // Validate input (already typed, but keeps runtime safety)
  const input = productFormSchema.parse(data)

  // Insert product with new fields
  const [product] = await db
    .insert(products)
    .values({
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      status: input.status,
      isDownloadable: input.isDownloadable ?? false,
    })
    .returning()

  // Relate categories
  if (input.categoryIds?.length) {
    await db.insert(productCategories).values(
      input.categoryIds.map((categoryId) => ({
        productId: product.id,
        categoryId,
      }))
    )
  }

  // Relate tags
  if (input.tagIds?.length) {
    await db.insert(productTags).values(
      input.tagIds.map((tagId) => ({
        productId: product.id,
        tagId,
      }))
    )
  }

  // Attach media
  if (input.mediaIds?.length) {
    await db.update(media)
      .set({ productId: product.id })
      .where(inArray(media.id, input.mediaIds))
  }

  // Insert downloads if product is downloadable
  if (input.isDownloadable && input.downloads?.length) {
    await db.insert(downloads).values(
      input.downloads.map((d) => ({
        productId: product.id,
        type: d.type,
        url: d.url,
        maxDownloads: d.maxDownloads ?? 0,
      }))
    )
  }

  return product
})

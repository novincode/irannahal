'use server'
import { db } from "@db"
import { products, productCategories, productTags, media, downloads, meta } from "@db/schema"
import { productFormSchema, ProductFormInput } from "./formSchema"
import { withRole } from "@actions/utils"
import { inArray } from "drizzle-orm"
import type { UserSchema } from "@db/types"
import { createFields } from "@actions/meta/create"
import { flattenMeta } from "@actions/meta/utils"
import { createDownloads } from "@actions/downloads/create"

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
      content: input.content,
      thumbnailId: input.thumbnailId ?? null, // Save thumbnailId
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
    await createDownloads(product.id, input.downloads)
  }

  // Insert meta fields (ACF-style)
  if (input.meta) {
    const metaRows = flattenMeta(input.meta).map(({ key, value }) => ({
      key,
      value: typeof value === "string" ? value : String(value),
    }))
    if (metaRows.length) {
      await createFields({ type: "product", entityId: product.id, fields: metaRows })
    }
  }

  return product
})

'use server'
import { db } from "@db"
import { products, productCategories, productTags, media, downloads, meta } from "@db/schema"
import { productEditorSchema, type ProductEditorData } from "@ui/components/admin/editor/schemas/editorSchemas"
import { withRole } from "@actions/utils"
import { inArray } from "drizzle-orm"
import type { UserSchema } from "@db/types"
import { createFields } from "@actions/meta/create"
import { flattenMeta } from "@actions/meta"
import { createDownloads } from "@actions/downloads/create"

export const createProduct = withRole(["admin", "author"])(async (user: UserSchema, data: ProductEditorData) => {
  // Validate input (already typed, but keeps runtime safety)
  const input = productEditorSchema.parse(data)

  // Insert product with new fields
  const [product] = await db
    .insert(products)
    .values({
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      status: input.status,
      isDownloadable: (input.downloads?.length ?? 0) > 0,
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

  // Insert downloads if product has downloads
  if (input.downloads?.length) {
    // Transform form downloads to DownloadInput format - access properties from validated input
    const downloadInputs = input.downloads.map(download => ({
      type: download.type,
      url: download.url,
      maxDownloads: download.maxDownloads
    }))
    await createDownloads(product.id, downloadInputs)
  }

  // Insert meta fields (ACF-style)
  if (input.meta) {
    const metaRows = flattenMeta(input.meta).map(({ key, value }: { key: string; value: any }) => ({
      key,
      value: typeof value === "string" ? value : String(value),
    }))
    if (metaRows.length) {
      await createFields({ type: "product", entityId: product.id, fields: metaRows })
    }
  }

  return product
})

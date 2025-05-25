'use server'
import { db } from "@db"
import { products, productCategories, productTags, media } from "@db/schema"
import { eq, inArray } from "drizzle-orm"
import { ProductFormInput } from "./formSchema"
import { withRole } from "@actions/utils"
import { flattenMeta } from "@actions/meta/utils"
import { updateFields } from "@actions/meta/update"
import { deleteProductFields } from "@actions/meta/delete"
import { updateDownloads } from "@actions/downloads/update"

export const updateProduct = withRole(["admin", "author"])(async (user, data: ProductFormInput & { id: string }) => {
  // Only update allowed fields
  const { id, meta, downloads: downloadsInput, categoryIds, tagIds, mediaIds, ...updateData } = data
  await db.update(products).set(updateData).where(eq(products.id, id))

  // Update categories
  if (Array.isArray(categoryIds)) {
    // Remove all previous categories
    await db.delete(productCategories).where(eq(productCategories.productId, id))
    // Insert new categories
    if (categoryIds.length) {
      await db.insert(productCategories).values(
        categoryIds.map((categoryId) => ({ productId: id, categoryId }))
      )
    }
  }

  // Update tags
  if (Array.isArray(tagIds)) {
    // Remove all previous tags
    await db.delete(productTags).where(eq(productTags.productId, id))
    // Insert new tags
    if (tagIds.length) {
      await db.insert(productTags).values(
        tagIds.map((tagId) => ({ productId: id, tagId }))
      )
    }
  }

  // Update media
  if (Array.isArray(mediaIds)) {
    // Detach all media from this product
    await db.update(media).set({ productId: null }).where(eq(media.productId, id))
    // Attach new media
    if (mediaIds.length) {
      await db.update(media)
        .set({ productId: id })
        .where(inArray(media.id, mediaIds))
    }
  }

  // Update downloads (remove previous, insert new)
  if (updateData.isDownloadable && downloadsInput) {
    await updateDownloads(id, downloadsInput)
  } else {
    // If not downloadable, remove all downloads
    await updateDownloads(id, [])
  }

  // Update meta fields (ACF-style)
  if (meta) {
    // Remove all previous meta fields for this product (efficient)
    await deleteProductFields(id)
    // Insert new meta fields
    const metaRows = flattenMeta(meta).map(({ key, value }) => ({
      key,
      value: typeof value === "string" ? value : String(value),
    }))
    if (metaRows.length) {
      await updateFields({ type: "product", entityId: id, fields: metaRows })
    }
  }
})

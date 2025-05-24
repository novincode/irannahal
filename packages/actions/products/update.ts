'use server'
import { db } from "@db"
import { products } from "@db/schema"
import { eq } from "drizzle-orm"
import { ProductFormInput } from "./formSchema"
import { withRole } from "@actions/utils"
import { flattenMeta } from "@actions/meta/utils"
import { updateFields } from "@actions/meta/update"
import { deleteProductFields } from "@actions/meta/delete"
import { updateDownloads } from "@actions/downloads/update"

export const updateProduct = withRole(["admin", "author"])(async (user, data: ProductFormInput & { id: string }) => {
  // Only update allowed fields
  const { id, meta, downloads: downloadsInput, ...updateData } = data
  await db.update(products).set(updateData).where(eq(products.id, id))

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

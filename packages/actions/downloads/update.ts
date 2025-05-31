'use server'
import { db } from "@db"
import { downloads } from "@db/schema"
import { eq } from "drizzle-orm"
import type { DownloadInput } from "./create"

export async function updateDownloads(productId: string, downloadItems: DownloadInput[]) {
  // Remove previous downloads
  await db.delete(downloads).where(eq(downloads.productId, productId))
  // Insert new downloads
  if (!downloadItems?.length) return []
  const rows = downloadItems.map(d => ({
    productId,
    type: d.type,
    url: d.url,
    maxDownloads: d.maxDownloads ?? 0,
  }))
  return db.insert(downloads).values(rows).returning()
}

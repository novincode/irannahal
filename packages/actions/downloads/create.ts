import { db } from "@db"
import { downloads } from "@db/schema"

export type DownloadType = "file" | "link"

export interface DownloadInput {
  type: DownloadType
  url: string
  maxDownloads?: number
}

export async function createDownloads(productId: string, downloadItems: DownloadInput[]) {
  if (!downloadItems?.length) return []
  const rows = downloadItems.map(d => ({
    productId,
    type: d.type as DownloadType,
    url: d.url,
    maxDownloads: d.maxDownloads ?? 0,
  }))
  return db.insert(downloads).values(rows).returning()
}

import { db } from "@db"
import { downloads } from "@db/schema"
import { eq } from "drizzle-orm"

export async function deleteDownloadsByProduct(productId: string) {
  return db.delete(downloads).where(eq(downloads.productId, productId))
}

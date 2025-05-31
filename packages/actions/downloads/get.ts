'use server'
import { db } from "@db"
import { downloads } from "@db/schema"
import { eq } from "drizzle-orm"

export async function getDownloadsByProduct(productId: string) {
  return db.select().from(downloads).where(eq(downloads.productId, productId))
}

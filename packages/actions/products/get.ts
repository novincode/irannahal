'use server'
import { db } from "@db"
import { products } from "@db/schema"
import { eq } from "drizzle-orm"

export async function getProduct(id: string) {
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1)
  return result[0] ?? null
}

export async function getProducts() {
  return db.select().from(products)
}

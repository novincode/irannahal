'use server'
import { db } from "@db"
import { products } from "@db/schema"
import { eq } from "drizzle-orm"
import type { ProductWithDynamicRelations, ProductRelations } from "./types"

export async function getProduct<TWith extends ProductRelations>(
  id: string,
  opts?: { with?: TWith }
): Promise<ProductWithDynamicRelations<TWith> | null> {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: opts?.with,
  })
  return product as unknown as ProductWithDynamicRelations<TWith> | null
}

export async function getProducts<TWith extends ProductRelations>(
  opts?: { with?: TWith }
): Promise<ProductWithDynamicRelations<TWith>[]> {
  const result = await db.query.products.findMany({
    with: opts?.with,
  })
  return result as unknown as ProductWithDynamicRelations<TWith>[]
}

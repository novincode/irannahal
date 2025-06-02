'use server'
import { db } from "@db"
import { products } from "@db/schema"
import { eq } from "drizzle-orm"
import type { ProductWithDynamicRelations, ProductRelations } from "./types"

function normalizeWith<TWith extends ProductRelations>(withOpt?: TWith): TWith | undefined {
  if (!withOpt) return undefined;
  // If user requests categories/tags as true, convert to nested join
  const newWith: any = { ...withOpt };
  if (withOpt.categories === true) {
    newWith.categories = { with: { category: true } };
  }
  if (withOpt.tags === true) {
    newWith.tags = { with: { tag: true } };
  }
  return newWith;
}

export async function getProduct<TWith extends ProductRelations>(
  id: string,
  opts?: { with?: TWith }
): Promise<ProductWithDynamicRelations<TWith> | null> {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: normalizeWith(opts?.with),
  })
  return product as unknown as ProductWithDynamicRelations<TWith> | null
}

export async function getProducts<TWith extends ProductRelations>(
  opts?: { with?: TWith }
): Promise<ProductWithDynamicRelations<TWith>[]> {
  const result = await db.query.products.findMany({
    with: normalizeWith(opts?.with),
  })
  return result as unknown as ProductWithDynamicRelations<TWith>[]
}

export async function getProductBySlug<TWith extends ProductRelations>(
  slug: string,
  opts?: { with?: TWith }
): Promise<ProductWithDynamicRelations<TWith> | null> {
  const product = await db.query.products.findFirst({
    where: eq(products.slug, decodeURIComponent(slug)),
    with: normalizeWith(opts?.with),
  })
  return product as unknown as ProductWithDynamicRelations<TWith> | null
}

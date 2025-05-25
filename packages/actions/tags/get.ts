'use server'
import { db } from "@db"
import { tags, products, productTags } from "@db/schema"
import { eq, ilike } from "drizzle-orm"
import type { TagWithDynamicRelations, TagRelations } from "./types"

export async function getTag<TWith extends TagRelations>(
  id: string,
  opts?: { with?: TWith }
): Promise<TagWithDynamicRelations<TWith> | null> {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, id),
    with: opts?.with,
  })
  return tag as unknown as TagWithDynamicRelations<TWith> | null
}

export async function getTags<TWith extends TagRelations>(
  opts?: { with?: TWith }
): Promise<TagWithDynamicRelations<TWith>[]> {
  const result = await db.query.tags.findMany({
    with: opts?.with,
  })
  return result as unknown as TagWithDynamicRelations<TWith>[]
}

export async function getTagsWithProductCount() {
  // Fetch tags with their related products (full product objects)
  const tags = await db.query.tags.findMany({
    with: {
      products: {
        columns: {},
        with: {
          product: true,
        },
      },
    },
  })
  // Map to TagWithDynamicRelations<{ products: true }>
  return tags.map(tag => ({
    ...tag,
    products: tag.products.map(pt => pt.product).filter(Boolean),
  }))
}

// Add a searchTags function for querying tags by name
export async function searchTags(query: string) {
  if (!query) return []
  const result = await db.query.tags.findMany({
    where: ilike(tags.name, `%${query}%`),
  })
  return result
}

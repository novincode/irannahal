'use server'
import { db } from "@db"
import { categories } from "@db/schema"
import { eq } from "drizzle-orm"
import type { CategoryWithDynamicRelations, CategoryRelations } from "./types"

export async function getCategory<TWith extends CategoryRelations>(
  id: string,
  opts?: { with?: TWith }
): Promise<CategoryWithDynamicRelations<TWith> | null> {
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: opts?.with,
  })
  return category as unknown as CategoryWithDynamicRelations<TWith> | null
}

export async function getCategories<TWith extends CategoryRelations>(
  opts?: { with?: TWith }
): Promise<CategoryWithDynamicRelations<TWith>[]> {
  const result = await db.query.categories.findMany({
    with: opts?.with,
  })
  return result as unknown as CategoryWithDynamicRelations<TWith>[]
}

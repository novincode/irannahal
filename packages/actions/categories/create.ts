'use server'
import { db } from "@db"
import { categories } from "@db/schema"
import { categoryFormSchema, CategoryFormInput } from "./formSchema"
import { withRole } from "@actions/utils"
import type { UserSchema } from "@db/types"

export const createCategory = withRole(["admin", "author"])(async (user: UserSchema, data: CategoryFormInput) => {
  const input = categoryFormSchema.parse(data)
  const [category] = await db.insert(categories).values({
    name: input.name,
    slug: input.slug,
    parentId: input.parentId ?? null,
  }).returning()
  return category
})

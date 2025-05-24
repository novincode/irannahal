'use server'
import { db } from "@db"
import { categories } from "@db/schema"
import { eq } from "drizzle-orm"
import { updateCategorySchema, UpdateCategoryInput } from "./formSchema"
import { withRole } from "@actions/utils"

export const updateCategory = withRole(["admin", "author"])(async (user, data: UpdateCategoryInput) => {
  const input = updateCategorySchema.parse(data)
  const { id, ...updateData } = input
  await db.update(categories).set(updateData).where(eq(categories.id, id))
})

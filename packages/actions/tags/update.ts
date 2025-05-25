'use server'
import { db } from "@db"
import { tags } from "@db/schema"
import { updateTagSchema, UpdateTagInput } from "./formSchema"
import { withRole } from "@actions/utils"
import type { UserSchema } from "@db/types"
import { eq } from "drizzle-orm"

export const updateTag = withRole(["admin", "author"])(async (user: UserSchema, data: UpdateTagInput) => {
  const input = updateTagSchema.parse(data)
  const { id, ...updateData } = input
  await db.update(tags).set(updateData).where(eq(tags.id, id))
})

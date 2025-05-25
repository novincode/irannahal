'use server'
import { db } from "@db"
import { tags } from "@db/schema"
import { eq, inArray } from "drizzle-orm"
import { withRole } from "@actions/utils"
import type { UserSchema } from "@db/types"

export const deleteTag = withRole(["admin"])(async (user: UserSchema, id: string) => {
  const [tag] = await db.delete(tags).where(eq(tags.id, id)).returning()
  return tag
})

export const deleteTags = withRole(["admin"])(async (user: UserSchema, ids: string[]) => {
  if (!Array.isArray(ids) || ids.length === 0) return []
  const deleted = await db.delete(tags).where(inArray(tags.id, ids)).returning()
  return deleted
})

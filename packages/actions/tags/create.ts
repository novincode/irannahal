'use server'
import { db } from "@db"
import { tags } from "@db/schema"
import { tagFormSchema, TagFormInput } from "./formSchema"
import { withRole } from "@actions/utils"
import type { UserSchema } from "@db/types"

export const createTag = withRole(["admin", "author"])(async (user: UserSchema, data: TagFormInput) => {
  const input = tagFormSchema.parse(data)
  const [tag] = await db.insert(tags).values({
    name: input.name,
    slug: input.slug,
  }).returning()
  return tag
})
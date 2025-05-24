'use server'
import { db } from "@db"
import { media } from "@db/schema"
import { mediaFormSchema, MediaFormInput } from "./formSchema"
import { withRole } from "@actions/utils"
import type { UserSchema } from "@db/types"

export const createMedia = withRole(["admin", "author"])(async (user: UserSchema, data: MediaFormInput) => {
  const input = mediaFormSchema.parse(data)
  const [result] = await db.insert(media).values(input).returning()
  return result
})

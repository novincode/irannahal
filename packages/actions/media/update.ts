'use server'
import { db } from "@db"
import { media } from "@db/schema"
import { eq } from "drizzle-orm"
import { mediaFormSchema, MediaFormInput } from "./formSchema"
import { withRole } from "@actions/utils"
import type { UserSchema } from "@db/types"

export const updateMedia = withRole(["admin", "author"])(async (user: UserSchema, data: MediaFormInput & { id: string }) => {
  const { id, ...rest } = data
  const input = mediaFormSchema.partial().parse(rest)
  const [result] = await db.update(media).set(input).where(eq(media.id, id)).returning()
  return result
})

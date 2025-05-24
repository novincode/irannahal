'use server'
import { db } from "@db"
import { media } from "@db/schema"
import { eq } from "drizzle-orm"
import { withRole } from "@actions/utils"
import type { UserSchema } from "@db/types"
import { cloudinaryDeleteProvider } from "./providers/cloudinary"


export type MediaDeleteProvider = (url: string) => Promise<void>

export const deleteMedia = withRole(["admin", "author"])(async (user: UserSchema, id: string, deleteProvider: MediaDeleteProvider = cloudinaryDeleteProvider) => {
    // Get media row first
    const mediaRow = await db.query.media.findFirst({ where: eq(media.id, id) })
    if (mediaRow) {
        await deleteProvider(mediaRow.url)
    }
    await db.delete(media).where(eq(media.id, id))
})

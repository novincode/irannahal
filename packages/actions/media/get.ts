'use server'
import { db } from "@db"
import { media } from "@db/schema"
import { desc } from "drizzle-orm"

export async function getMedias() {
  return db.query.media.findMany({ orderBy: [desc(media.createdAt)] })
}

export async function getMediaById(id: string) {
  return db.query.media.findFirst({ where: (m, { eq }) => eq(m.id, id) })
}

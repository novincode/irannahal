'use server'
import { db } from "@db"
import { meta } from "@db/schema"
import { eq, and } from "drizzle-orm"

export type MetaType = "post" | "product" | "global"

// Get all meta fields for a given type and entity (e.g., productId)
export async function getFields({ type, entityId }: { type: MetaType, entityId: string }) {
  return db.select().from(meta).where(and(eq(meta.type, type), eq(type === "product" ? meta.productId : meta.postId, entityId)))
}

// Get a single meta field by key
export async function getField({ type, entityId, key }: { type: MetaType, entityId: string, key: string }) {
  return db.select().from(meta).where(and(eq(meta.type, type), eq(type === "product" ? meta.productId : meta.postId, entityId), eq(meta.key, key))).then(rows => rows[0] || null)
}

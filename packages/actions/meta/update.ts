'use server'
import { db } from "@db"
import { meta } from "@db/schema"
import { eq, and, inArray } from "drizzle-orm"
import { createFields } from "./create"
import type { MetaType } from "./get"

// Bulk update (upsert) meta fields
export async function updateFields({ type, entityId, fields }: { type: MetaType, entityId: string, fields: { key: string, value: string }[] }) {
  // Remove all old fields with these keys, then insert new
  const keys = fields.map(f => f.key)
  await db.delete(meta).where(and(eq(meta.type, type), eq(type === "product" ? meta.productId : meta.postId, entityId), inArray(meta.key, keys)))
  return createFields({ type, entityId, fields })
}

// Create or update a single field (if value is empty, remove it)
export async function updateField({ type, entityId, key, value }: { type: MetaType, entityId: string, key: string, value: string | null | undefined }) {
  if (value === undefined || value === null || value === "") {
    return db.delete(meta).where(and(eq(meta.type, type), eq(type === "product" ? meta.productId : meta.postId, entityId), eq(meta.key, key)))
  }
  // Remove old, insert new
  await db.delete(meta).where(and(eq(meta.type, type), eq(type === "product" ? meta.productId : meta.postId, entityId), eq(meta.key, key)))
  return db.insert(meta).values({
    type,
    [type === "product" ? "productId" : "postId"]: entityId,
    key,
    value,
  })
}

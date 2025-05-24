import { db } from "@db"
import { meta } from "@db/schema"
import { eq, and, inArray } from "drizzle-orm"
import type { MetaType } from "./get"

// Remove a single field
export async function removeField({ type, entityId, key }: { type: MetaType, entityId: string, key: string }) {
  return db.delete(meta).where(and(eq(meta.type, type), eq(type === "product" ? meta.productId : meta.postId, entityId), eq(meta.key, key)))
}

// Remove multiple fields by key
export async function removeFields({ type, entityId, keys }: { type: MetaType, entityId: string, keys: string[] }) {
  return db.delete(meta).where(and(eq(meta.type, type), eq(type === "product" ? meta.productId : meta.postId, entityId), inArray(meta.key, keys)))
}

// Remove all meta fields for a product
export async function deleteProductFields(productId: string) {
  return db.delete(meta).where(and(eq(meta.type, "product"), eq(meta.productId, productId)))
}

// Remove all meta fields for a post
export async function deletePostFields(postId: string) {
  return db.delete(meta).where(and(eq(meta.type, "post"), eq(meta.postId, postId)))
}

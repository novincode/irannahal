import { db } from "@db"
import { meta } from "@db/schema"

import type { MetaType } from "./get"

// Bulk create meta fields
export async function createFields({ type, entityId, fields }: { type: MetaType, entityId: string, fields: { key: string, value: string }[] }) {
  if (!fields.length) return []
  return db.insert(meta).values(fields.map(f => ({
    type,
    [type === "product" ? "productId" : "postId"]: entityId,
    key: f.key,
    value: f.value,
  })))
}

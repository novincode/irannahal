import type {
  ProductSchema,
  TagSchema,
  CategorySchema,
  DownloadSchema,
  MediaSchema,
} from "@db/types"

import type { WithRelations, RelationInput } from "@db/relation-helpers"

export const productRelationNames = ["tags", "categories", "downloads", "media", "meta", "thumbnail"] as const
export type ProductRelationName = typeof productRelationNames[number]

export type ProductMetaRow = { id: string; type: string; key: string; value: string | null; postId?: string | null; productId?: string | null }

export type ProductRelationsMap = {
  tags: TagSchema[]
  categories: CategorySchema[]
  downloads: DownloadSchema[]
  media: MediaSchema[]
  meta: ProductMetaRow[]
  thumbnail: MediaSchema | null
}

export type ProductRelations = RelationInput<ProductRelationsMap>
export type ProductWithDynamicRelations<TWith extends ProductRelations = {}> = WithRelations<
  ProductSchema,
  ProductRelationsMap,
  TWith
>

// Optional: IDE helper
export const productWith = <T extends ProductRelations>(relations: T) => relations

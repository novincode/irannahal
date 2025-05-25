import type { TagSchema, ProductSchema } from "@db/types"
import type { WithRelations, RelationInput } from "@db/relation-helpers"

export const tagRelationNames = ["products"] as const
export type TagRelationName = typeof tagRelationNames[number]

export type TagRelationsMap = {
  products: ProductSchema[]
}

export type TagRelations = RelationInput<TagRelationsMap>
export type TagWithDynamicRelations<TWith extends TagRelations = {}> = WithRelations<
  TagSchema,
  TagRelationsMap,
  TWith
>

export const tagWith = <T extends TagRelations>(relations: T) => relations

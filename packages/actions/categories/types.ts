import type { CategorySchema, ProductSchema } from "@db/types"
import type { WithRelations, RelationInput } from "@db/relation-helpers"

export const categoryRelationNames = ["products", "parent", "subCategories"] as const
export type CategoryRelationName = typeof categoryRelationNames[number]

export type CategoryRelationsMap = {
  products: ProductSchema[]
  parent: CategorySchema | null
  subCategories: CategorySchema[]
}

export type CategoryRelations = RelationInput<CategoryRelationsMap>
export type CategoryWithDynamicRelations<TWith extends CategoryRelations = {}> = WithRelations<
  CategorySchema,
  CategoryRelationsMap,
  TWith
>

export const categoryWith = <T extends CategoryRelations>(relations: T) => relations

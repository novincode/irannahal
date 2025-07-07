import type { UserSchema } from "@db/types"
import type { WithRelations, RelationInput } from "@db/relation-helpers"
import type { OrderSchema } from "@db/types"

// Define available relations for users
export const userRelationNames = ["orders"] as const
export type UserRelationName = typeof userRelationNames[number]

// Define the relations map
export type UserRelationsMap = {
  orders: OrderSchema[]
}

export type UserRelations = RelationInput<UserRelationsMap>
export type UserWithDynamicRelations<TWith extends UserRelations = {}> = WithRelations<
  UserSchema,
  UserRelationsMap,
  TWith
>

// Optional: IDE helper
export const userWith = <T extends UserRelations>(relations: T) => relations

// ========== USER FILTERING TYPES ==========

export interface GetUsersParams {
  search?: string
  role?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface UsersResult {
  users: UserSchema[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ========== USER STATS TYPES ==========
export interface UserStats {
  totalOrders: number
  totalSpent: number
  pendingOrders: number
  shippedOrders: number
  averageOrderValue: number
}

// relation-helpers.ts

export type RelationMap = Record<string, unknown>
export type RelationInput<TMap extends RelationMap> = Partial<Record<keyof TMap, true | undefined>>

type TrueKeys<T> = { [K in keyof T]: T[K] extends true ? K : never }[keyof T]

export type WithRelations<TBase, TMap extends RelationMap, TWith extends RelationInput<TMap> = {}> =
  TBase & {
    [K in TrueKeys<TWith> & keyof TMap]: TMap[K]
  }

export const withRelations = <T extends RelationInput<any>>(relations: T) => relations

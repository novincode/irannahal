"use server"

import { db } from "@db"
import { addresses } from "@db/schema"
import { and, eq, isNull, desc } from "drizzle-orm"
import { withAuth } from "../utils"
import type { Address } from "./types"

export async function getAddresses(): Promise<Address[]> {
  return withAuth(async (user) => {
    try {
      const result = await db
        .select()
        .from(addresses)
        .where(
          and(
            eq(addresses.userId, user.id),
            isNull(addresses.deletedAt)
          )
        )
        .orderBy(desc(addresses.isDefault), desc(addresses.createdAt))

      return result
    } catch (error) {
      console.error("Error fetching addresses:", error)
      throw new Error("خطا در دریافت آدرس‌ها")
    }
  })
}

export async function getAddress(id: string): Promise<Address | null> {
  return withAuth(async (user) => {
    try {
      const result = await db
        .select()
        .from(addresses)
        .where(
          and(
            eq(addresses.id, id),
            eq(addresses.userId, user.id),
            isNull(addresses.deletedAt)
          )
        )
        .limit(1)

      return result[0] || null
    } catch (error) {
      console.error("Error fetching address:", error)
      throw new Error("خطا در دریافت آدرس")
    }
  })
}

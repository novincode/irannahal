"use server"

import { db } from "@db"
import { addresses } from "@db/schema"
import { and, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { withAuth } from "../utils"

export async function deleteAddress(id: string): Promise<void> {
  return withAuth(async (user) => {
    try {
      // Verify the address belongs to the current user
      const existingAddress = await db
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

      if (!existingAddress[0]) {
        throw new Error("آدرس یافت نشد")
      }

    // Soft delete the address
      await db
        .update(addresses)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(addresses.id, id))

      revalidatePath("/panel/addresses")
    } catch (error) {
      console.error("Error deleting address:", error)
      throw new Error("خطا در حذف آدرس")
    }
  })
}

"use server"

import { db } from "@db"
import { addresses } from "@db/schema"
import { and, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { withAuth } from "../utils"
import type { AddressFormInput } from "./formSchema"
import type { Address } from "./types"

export async function updateAddress(id: string, data: AddressFormInput): Promise<Address> {
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

      // If this is set as default, unset all other default addresses
      if (data.isDefault) {
        await db
          .update(addresses)
          .set({ 
            isDefault: false,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(addresses.userId, user.id),
              eq(addresses.isDefault, true),
              isNull(addresses.deletedAt)
            )
          )
      }

      const result = await db
        .update(addresses)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(addresses.id, id))
        .returning()

      revalidatePath("/panel/addresses")
      return result[0]
    } catch (error) {
      console.error("Error updating address:", error)
      throw new Error("خطا در ویرایش آدرس")
    }
  })
}

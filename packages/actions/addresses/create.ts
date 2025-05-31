"use server"

import { db } from "@db"
import { addresses } from "@db/schema"
import { and, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { withAuth } from "../utils"
import type { AddressFormInput } from "./formSchema"
import type { Address } from "./types"

export async function createAddress(data: AddressFormInput): Promise<Address> {
  return withAuth(async (user) => {
    try {
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
        .insert(addresses)
        .values({
          ...data,
          userId: user.id,
        })
        .returning()

      revalidatePath("/panel/addresses")
      return result[0]
    } catch (error) {
      console.error("Error creating address:", error)
      throw new Error("خطا در ایجاد آدرس")
    }
  })
}

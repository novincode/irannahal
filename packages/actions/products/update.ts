'use server'
import { db } from "@db"
import { products } from "@db/schema"
import { eq } from "drizzle-orm"
import { ProductFormInput } from "./formSchema"
import { withRole } from "@actions/utils"

export const updateProduct = withRole(["admin", "author"])(async (user, data: ProductFormInput & { id: string }) => {
  // Only update allowed fields
  const { id, ...updateData } = data
  await db.update(products).set(updateData).where(eq(products.id, id))
})

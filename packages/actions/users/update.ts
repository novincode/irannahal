'use server'
import { db } from "@db"
import { users } from "@db/schema"
import { eq } from "drizzle-orm"

export interface UpdateUserData {
  name?: string
  email?: string
  phone?: string
  image?: string
}

export async function updateUser(id: string, data: UpdateUserData) {
  const [user] = await db.update(users)
    .set({
      name: data.name,
      email: data.email,
      phone: data.phone,
      image: data.image,
    })
    .where(eq(users.id, id))
    .returning()
  
  return user
}

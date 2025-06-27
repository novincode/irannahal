'use server'
import { db } from "@db"
import { users } from "@db/schema"
import type { UserRole } from "@db/schema"

export interface CreateUserData {
  name?: string
  email?: string
  phone?: string
  role?: UserRole
  image?: string
}

export async function createUser(data: CreateUserData) {
  const [user] = await db.insert(users).values({
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role || 'user',
    image: data.image,
  }).returning()
  
  return user
}

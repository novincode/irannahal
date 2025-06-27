'use server'
import { db } from "@db"
import { users } from "@db/schema"

export async function getUser(id: string) {
  return db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, id) })
}

export async function getUserByPhone(phone: string) {
  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.phone, phone) })
  return user || null
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, email) })
}
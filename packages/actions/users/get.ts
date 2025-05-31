'use server'
import { db } from "@db"
import { users } from "@db/schema"

export async function getUser(id: string) {
  return db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, id) })
}
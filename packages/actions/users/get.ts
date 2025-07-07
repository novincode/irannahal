'use server'
import { db } from "@db"
import { users, userRoleEnum } from "@db/schema"
import { sql } from "drizzle-orm"
import { desc, ilike, or, and, isNull, isNotNull, eq } from "drizzle-orm"
import type { UserSchema } from "@db/types"

export interface GetUsersParams {
  search?: string
  role?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface GetUsersResult {
  users: UserSchema[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getUsers(params: GetUsersParams = {}): Promise<GetUsersResult> {
  const {
    search = "",
    role,
    status,
    page = 1,
    pageSize = 20,
  } = params

  const where: any[] = []
  
  if (search) {
    where.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.phone, `%${search}%`)
      )
    )
  }
  
  if (role && role !== 'all') {
    where.push(eq(users.role, role as typeof userRoleEnum.enumValues[number]))
  }
  
  if (status === "deleted") {
    where.push(isNotNull(users.deletedAt))
  } else if (status === "active") {
    where.push(isNull(users.deletedAt))
  }

  const offset = (page - 1) * pageSize

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(where.length ? and(...where) : undefined)

  const total = Number(totalResult?.count) || 0

  const data = await db.query.users.findMany({
    where: where.length ? and(...where) : undefined,
    orderBy: [desc(users.emailVerified)],
    limit: pageSize,
    offset,
    columns: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      deletedAt: true,
      emailVerified: true,
    },
  })

  return {
    users: data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

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
import { auth } from "@auth"
import { db } from "@db"
import { users } from "@db/schema"
import { eq } from "drizzle-orm"

// Throws if not authenticated, returns user row from DB
export const withAuth = async <T>(fn: (user: typeof users.$inferSelect) => Promise<T>) => {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
  if (!user) throw new Error("User not found")
  return fn(user)
}

// Throws if not admin, returns user row from DB
export const withAdmin = async <T>(fn: (user: typeof users.$inferSelect) => Promise<T>) => {
  return withAuth(async (user) => {
    if (user.role !== "admin") throw new Error("Forbidden")
    return fn(user)
  })
}

// Generic role-based wrapper
export const withRole = (roles: string[]) => {
  return <T, Args extends any[]>(fn: (user: typeof users.$inferSelect, ...args: Args) => Promise<T>) => {
    return async (...args: Args) => {
      return withAuth((user) => {
        if (!roles.includes(user.role)) throw new Error("Forbidden")
        return fn(user, ...args)
      })
    }
  }
}
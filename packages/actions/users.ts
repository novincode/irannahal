'use server'
import { db } from "@db";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export async function getUser(id: string) {
  const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user[0] ?? null;
}
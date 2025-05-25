'use server'

import { db } from "@db"
import { categories } from "@db/schema"
import { eq, inArray } from "drizzle-orm"

/**
 * Delete a category by ID while properly handling parent-child relationships
 * When a parent category is deleted, its children become parentless (not deleted)
 */
export async function deleteCategory(id: string): Promise<{ success: boolean, error?: string }> {
  try {
    // 1. Find all children categories of this category
    const childrenCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, id))

    // 2. Update all children to have null parentId (make them parentless)
    if (childrenCategories.length > 0) {
      await db
        .update(categories)
        .set({ parentId: null })
        .where(eq(categories.parentId, id))
    }

    // 3. Finally, delete the category itself
    await db
      .delete(categories)
      .where(eq(categories.id, id))

    return { success: true }
  } catch (error) {
    console.error("Failed to delete category:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }
  }
}

export async function deleteCategories(ids: string[]): Promise<{ success: boolean; error?: string }[]> {
  if (!Array.isArray(ids) || ids.length === 0) return []
  const results: { success: boolean; error?: string }[] = []
  for (const id of ids) {
    try {
      // 1. Find all children categories of this category
      const childrenCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.parentId, id))
      // 2. Update all children to have null parentId (make them parentless)
      if (childrenCategories.length > 0) {
        await db
          .update(categories)
          .set({ parentId: null })
          .where(eq(categories.parentId, id))
      }
      // 3. Delete the category itself
      await db
        .delete(categories)
        .where(eq(categories.id, id))
      results.push({ success: true })
    } catch (error) {
      results.push({ success: false, error: error instanceof Error ? error.message : "Unknown error occurred" })
    }
  }
  return results
}
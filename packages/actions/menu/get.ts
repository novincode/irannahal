"use server"

import { eq, asc } from "drizzle-orm"
import { db } from "@db"
import { menus, menuItems } from "@db/schema"
import { withAuth, withAdmin } from "@actions/utils"
import type { 
  GetMenuResponse,
  GetMenusResponse,
  GetMenuWithItemsResponse,
  MenuWithItems,
  MenuItemWithChildren,
  GetLinkableResourcesResponse,
  LinkableResource,
  GroupedLinkableResources
} from "./types"

// ==========================================
// MENU RETRIEVAL
// ==========================================

export async function getMenuById(id: string): Promise<GetMenuResponse> {
  return withAuth(async (user) => {
    try {
      const [menu] = await db
        .select()
        .from(menus)
        .where(eq(menus.id, id))
        .limit(1)

      if (!menu) {
        return {
          success: false,
          error: "منو پیدا نشد",
          code: "MENU_NOT_FOUND",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      return {
        success: true,
        timestamp: new Date(),
        data: menu,
      }
    } catch (error) {
      console.error("Failed to get menu:", error)
      return {
        success: false,
        error: "خطا در دریافت منو",
        code: "INTERNAL_ERROR",
        timestamp: new Date(),
        data: undefined as never,
      }
    }
  })
}

export async function getAllMenus(): Promise<GetMenusResponse> {
  return withAuth(async (user) => {
    try {
      const allMenus = await db
        .select()
        .from(menus)
        .orderBy(asc(menus.name))

      return {
        success: true,
        timestamp: new Date(),
        data: allMenus,
      }
    } catch (error) {
      console.error("Failed to get menus:", error)
      return {
        success: false,
        error: "خطا در دریافت منوها",
        code: "INTERNAL_ERROR",
        timestamp: new Date(),
        data: undefined as never,
      }
    }
  })
}

export async function getUserMenus(): Promise<GetMenusResponse> {
  return withAuth(async (user) => {
    try {
      const userMenus = await db
        .select()
        .from(menus)
        .where(eq(menus.userId, user.id))
        .orderBy(asc(menus.name))

      return {
        success: true,
        timestamp: new Date(),
        data: userMenus,
      }
    } catch (error) {
      console.error("Failed to get user menus:", error)
      return {
        success: false,
        error: "خطا در دریافت منوهای کاربر",
        code: "INTERNAL_ERROR",
        timestamp: new Date(),
        data: undefined as never,
      }
    }
  })
}

export async function getMenuWithItems(id: string): Promise<GetMenuWithItemsResponse> {
  return withAuth(async (user) => {
    try {
      // Get menu
      const [menu] = await db
        .select()
        .from(menus)
        .where(eq(menus.id, id))
        .limit(1)

      if (!menu) {
        return {
          success: false,
          error: "منو پیدا نشد",
          code: "MENU_NOT_FOUND",
          timestamp: new Date(),
          data: undefined as never,
        }
      }

      // Get all menu items for this menu
      const allItems = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.menuId, id))
        .orderBy(asc(menuItems.order))

      // Build hierarchical structure
      const itemsWithChildren = buildMenuHierarchy(allItems)

      const menuWithItems: MenuWithItems = {
        ...menu,
        items: itemsWithChildren,
      }

      return {
        success: true,
        timestamp: new Date(),
        data: menuWithItems,
      }
    } catch (error) {
      console.error("Failed to get menu with items:", error)
      return {
        success: false,
        error: "خطا در دریافت منو و آیتم‌ها",
        code: "INTERNAL_ERROR",
        timestamp: new Date(),
        data: undefined as never,
      }
    }
  })
}

// ==========================================
// LINKABLE RESOURCES
// ==========================================

export async function getLinkableResources(): Promise<GetLinkableResourcesResponse> {
  return withAuth(async (user) => {
    try {
      // TODO: Implement actual resource fetching from posts, products, categories, tags, pages
      // For now, return empty structure
      const resources: GroupedLinkableResources = {
        post: [],
        product: [],
        category: [],
        tag: [],
        page: [],
      }

      return {
        success: true,
        timestamp: new Date(),
        data: resources,
      }
    } catch (error) {
      console.error("Failed to get linkable resources:", error)
      return {
        success: false,
        error: "خطا در دریافت منابع قابل لینک",
        code: "INTERNAL_ERROR",
        timestamp: new Date(),
        data: undefined as never,
      }
    }
  })
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function buildMenuHierarchy(flatItems: typeof menuItems.$inferSelect[]): MenuItemWithChildren[] {
  const itemMap = new Map<string, MenuItemWithChildren>()
  const rootItems: MenuItemWithChildren[] = []

  // First pass: create all items with empty children arrays
  flatItems.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] })
  })

  // Second pass: build hierarchy
  flatItems.forEach(item => {
    const itemWithChildren = itemMap.get(item.id)!
    
    if (item.parentId && itemMap.has(item.parentId)) {
      const parent = itemMap.get(item.parentId)!
      parent.children.push(itemWithChildren)
    } else {
      rootItems.push(itemWithChildren)
    }
  })

  return rootItems
}
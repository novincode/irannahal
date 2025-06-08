"use server"

import { eq, asc } from "drizzle-orm"
import { db } from "@db"
import { menus, menuItems } from "@db/schema"
import { withAuth } from "@actions/utils"
import type { 
  MenuWithItems,
  MenuItemWithChildren,
  LinkableResource,
  GroupedLinkableResources
} from "./types"

// ==========================================
// MENU RETRIEVAL
// ==========================================

export async function getMenuById(id: string) {
  return withAuth(async (user) => {
    const [menu] = await db
      .select()
      .from(menus)
      .where(eq(menus.id, id))
      .limit(1)

    if (!menu) {
      throw new Error("منو پیدا نشد")
    }

    return menu
  })
}

export async function getMenuBySlug(slug: string): Promise<MenuWithItems> {
  // Get menu by slug (no auth required for public menu display)
  const [menu] = await db
    .select()
    .from(menus)
    .where(eq(menus.slug, slug))
    .limit(1)

  if (!menu) {
    throw new Error("منو پیدا نشد")
  }

  // Get all menu items for this menu
  const allItems = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.menuId, menu.id))
    .orderBy(asc(menuItems.order))

  // Build hierarchical structure
  const itemsWithChildren = buildMenuHierarchy(allItems)

  const menuWithItems: MenuWithItems = {
    ...menu,
    items: itemsWithChildren,
  }

  return menuWithItems
}

export async function getAllMenus() {
  const allMenus = await db
    .select()
    .from(menus)
    .orderBy(asc(menus.name))

  return allMenus
}

export async function getUserMenus() {
  return withAuth(async (user) => {
    const userMenus = await db
      .select()
      .from(menus)
      .where(eq(menus.userId, user.id))
      .orderBy(asc(menus.name))

    return userMenus
  })
}

export async function getMenuWithItems(id: string): Promise<MenuWithItems> {
  // Get menu
  const [menu] = await db
    .select()
    .from(menus)
    .where(eq(menus.id, id))
    .limit(1)

  if (!menu) {
    throw new Error("منو پیدا نشد")
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

  return menuWithItems
}

// ==========================================
// LINKABLE RESOURCES
// ==========================================

export async function getLinkableResources(): Promise<GroupedLinkableResources> {
  return withAuth(async (user) => {
    // Import required schemas dynamically to avoid circular dependencies
    const { products } = await import("@db/schema")
    const { categories } = await import("@db/schema") 
    const { tags } = await import("@db/schema")
    
    // Fetch products with active status
    const rawProducts = await db
      .select({
        id: products.id,
        title: products.name,
        slug: products.slug,
        url: products.slug,
        status: products.status,
        lastModified: products.updatedAt,
      })
      .from(products)
      .where(eq(products.status, 'active'))
      .limit(50)

    // Fetch categories
    const rawCategories = await db
      .select({
        id: categories.id,
        title: categories.name,
        slug: categories.slug,
        url: categories.slug,
      })
      .from(categories)
      .limit(50)

    // Fetch tags
    const rawTags = await db
      .select({
        id: tags.id,
        title: tags.name,
        slug: tags.slug,
        url: tags.slug,
      })
      .from(tags)
      .limit(50)

    // Transform the raw data to LinkableResource format
    const fetchedProducts: LinkableResource[] = rawProducts.map(product => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      url: `/products/${product.slug}`,
      type: 'product' as const,
      status: product.status === 'active' ? 'published' as const : 
              product.status === 'inactive' ? 'archived' as const : 
              'draft' as const,
      lastModified: product.lastModified || new Date(),
    }))

    const fetchedCategories: LinkableResource[] = rawCategories.map(category => ({
      id: category.id,
      title: category.title,
      slug: category.slug,
      url: `/categories/${category.slug}`,
      type: 'category' as const,
      status: 'published' as const,
      lastModified: new Date(), // Categories don't have updatedAt, use current date
    }))

    const fetchedTags: LinkableResource[] = rawTags.map(tag => ({
      id: tag.id,
      title: tag.title,
      slug: tag.slug,
      url: `/tags/${tag.slug}`,
      type: 'tag' as const,
      status: 'published' as const,
      lastModified: new Date(), // Tags don't have updatedAt, use current date
    }))

    const resources: GroupedLinkableResources = {
      post: [], // TODO: Implement when posts schema is available
      product: fetchedProducts,
      category: fetchedCategories,
      tag: fetchedTags,
      page: [], // TODO: Implement when pages schema is available
    }

    return resources
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
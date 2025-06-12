import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  integer,
  json,
  primaryKey,
  pgEnum,
  index,
  unique,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ---------- Enums ----------
export const userRoleEnum = pgEnum("user_role", ["admin", "user", "author", "customer"])
export type UserRole = typeof userRoleEnum.enumValues[number]
export const postStatusEnum = pgEnum("post_status", ["draft", "published", "archived"])
export const productStatusEnum = pgEnum("product_status", ["draft", "active", "inactive", "out_of_stock"])
export const mediaTypeEnum = pgEnum("media_type", ["image", "video", "file"])
export const commentTypeEnum = pgEnum("comment_type", ["post", "product"])
export const metaTypeEnum = pgEnum("meta_type", ["post", "product", "global"])
export const downloadTypeEnum = pgEnum("download_type", ["file", "link"])
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed"])
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "shipped", "cancelled"])
export const cartStatusEnum = pgEnum("cart_status", ["active", "submitted", "abandoned"])
export const menuItemTypeEnum = pgEnum("menu_item_type", ["custom", "page", "category", "product", "tag", "external"])
export type MenuItemType = typeof menuItemTypeEnum.enumValues[number]

// ---------- Core Tables ----------
export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("user"),
  deletedAt: timestamp("deleted_at"),
})

export const accounts = pgTable("account", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, account => [primaryKey({ columns: [account.provider, account.providerAccountId] })])

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, token => [primaryKey({ columns: [token.identifier, token.token] })])

export const authenticators = pgTable("authenticator", {
  credentialID: text("credentialID").notNull().unique(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerAccountId: text("providerAccountId").notNull(),
  credentialPublicKey: text("credentialPublicKey").notNull(),
  counter: integer("counter").notNull(),
  credentialDeviceType: text("credentialDeviceType").notNull(),
  credentialBackedUp: boolean("credentialBackedUp").notNull(),
  transports: text("transports"),
}, auth => [primaryKey({ columns: [auth.userId, auth.credentialID] })])

// ---------- Content Tables ----------
export const posts = pgTable("post", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  content: text("content"),
  status: postStatusEnum("status").notNull().default("draft"),
  authorId: text("author_id").references(() => users.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

export const products = pgTable("product", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  status: productStatusEnum("status").notNull().default("draft"),
  isDownloadable: boolean("is_downloadable").notNull().default(false),
  content: text("content"),
  thumbnailId: uuid("thumbnail_id"), // Just define, add .references in relations
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

// ---------- Downloadable Products ----------
export const downloads = pgTable("download", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  type: downloadTypeEnum("type").notNull(),
  url: text("url").notNull(),
  maxDownloads: integer("max_downloads").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

// ---------- Shared Metadata ----------
export const meta = pgTable("meta", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: metaTypeEnum("type").notNull(),
  key: text("key").notNull(),
  value: text("value"),
  postId: uuid("post_id").references(() => posts.id),
  productId: uuid("product_id").references(() => products.id),
})

// ---------- Media ----------
export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  type: mediaTypeEnum("type").notNull(),
  alt: text("alt"),
  postId: uuid("post_id").references(() => posts.id),
  productId: uuid("product_id").references(() => products.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// ---------- Categories ----------
export const categories = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  parentId: uuid("parent_id"), // <-- just define, no .references
})

export const postCategories = pgTable("post_category", {
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }),
}, pc => [primaryKey({ columns: [pc.postId, pc.categoryId] })])

export const productCategories = pgTable("product_category", {
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }),
}, pc => [primaryKey({ columns: [pc.productId, pc.categoryId] })])

// ---------- Comments & Reviews ----------
export const comments = pgTable("comment", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id),
  type: commentTypeEnum("type").notNull(),
  postId: uuid("post_id").references(() => posts.id),
  productId: uuid("product_id").references(() => products.id),
  content: text("content").notNull(),
  rating: integer("rating"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
})

// ---------- Settings ----------
export const settings = pgTable("setting", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
})

// ---------- Tags ----------
export const tags = pgTable("tag", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
})

export const postTags = pgTable("post_tag", {
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").references(() => tags.id, { onDelete: "cascade" }),
}, pt => [primaryKey({ columns: [pt.postId, pt.tagId] })])

export const productTags = pgTable("product_tag", {
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").references(() => tags.id, { onDelete: "cascade" }),
}, pt => [primaryKey({ columns: [pt.productId, pt.tagId] })])

// ---------- Orders & Payments ----------
export const orders = pgTable("order", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id),
  discountId: uuid("discount_id").references(() => discounts.id, { onDelete: "set null" }),
  discountAmount: integer("discount_amount"),
  status: orderStatusEnum("status").notNull().default("pending"),
  total: integer("total").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

export const payments = pgTable("payment", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  status: paymentStatusEnum("status").notNull().default("pending"),
  method: text("method").notNull(),
  amount: integer("amount").notNull(),
  payload: json("payload"), // raw gateway response
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

// ---------- Order Items ----------
export const orderItems = pgTable("order_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  deletedAt: timestamp("deleted_at"),
})

// ---------- Carts & Cart Items ----------
export const carts = pgTable("cart", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  status: cartStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

export const cartItems = pgTable("cart_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id").references(() => carts.id, { onDelete: "cascade" }).notNull(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

// ---------- User Addresses ----------
export const addresses = pgTable("address", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  province: text("province").notNull(),
  city: text("city").notNull(),
  district: text("district"),
  address: text("address").notNull(),
  postalCode: text("postal_code").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

// ---------- Discounts ----------
export const discounts = pgTable("discount", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").unique().notNull(),
  type: text("type").notNull(),
  value: integer("value").notNull(),
  maxAmount: integer("max_amount"),
  minOrder: integer("min_order"),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  usageLimit: integer("usage_limit"),
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
}, table => ({
  codeIdx: index("discount_code_idx").on(table.code),
}))

// ---------- Menu System ----------
export const menus = pgTable("menu", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  location: text("location"), // e.g., "main", "footer", "sidebar"
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

export const menuItems = pgTable("menu_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  menuId: uuid("menu_id").notNull().references(() => menus.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references((): any => menuItems.id, { onDelete: "cascade" }),
  order: integer("order").notNull().default(0),
  label: text("label").notNull(),
  type: menuItemTypeEnum("type").notNull().default("custom"),
  url: text("url"), // For custom or external links
  target: text("target").default("_self"), // _self, _blank, etc.
  rel: text("rel"), // noopener, noreferrer, etc.
  linkedResourceId: uuid("linked_resource_id"), // For posts, products, categories, tags
  cssClasses: text("css_classes"), // Custom CSS classes
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

// ---------- Relations ----------
export const productsRelations = relations(products, ({ many, one }) => ({
  categories: many(productCategories),
  tags: many(productTags),
  downloads: many(downloads),
  media: many(media),
  meta: many(meta),
  thumbnail: one(media, { fields: [products.thumbnailId], references: [media.id] }),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  products: many(productCategories),
  posts: many(postCategories),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categoryParent',
  }),
  subCategories: many(categories, {
    relationName: 'categoryParent',
  }),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  products: many(productTags),
  posts: many(postTags),
}))

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, { fields: [productCategories.productId], references: [products.id] }),
  category: one(categories, { fields: [productCategories.categoryId], references: [categories.id] }),
}))

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, { fields: [productTags.productId], references: [products.id] }),
  tag: one(tags, { fields: [productTags.tagId], references: [tags.id] }),
}))

export const downloadsRelations = relations(downloads, ({ one }) => ({
  product: one(products, { fields: [downloads.productId], references: [products.id] }),
}))

export const mediaRelations = relations(media, ({ one }) => ({
  product: one(products, { fields: [media.productId], references: [products.id] }),
  post: one(posts, { fields: [media.postId], references: [posts.id] }),
}))

export const postsRelations = relations(posts, ({ many }) => ({
  categories: many(postCategories),
  tags: many(postTags),
  media: many(media),
  meta: many(meta),
}))

export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, { fields: [postCategories.postId], references: [posts.id] }),
  category: one(categories, { fields: [postCategories.categoryId], references: [categories.id] }),
}))

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}))

export const metaRelations = relations(meta, ({ one }) => ({
  product: one(products, { fields: [meta.productId], references: [products.id] }),
  post: one(posts, { fields: [meta.postId], references: [posts.id] }),
}))

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}))

export const discountsRelations = relations(discounts, ({ many }) => ({
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  discount: one(discounts, { fields: [orders.discountId], references: [discounts.id] }),
  items: many(orderItems),
  payments: many(payments),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}))

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  carts: many(carts),
}))

// ---------- Menu Relations ----------
export const menuRelations = relations(menus, ({ many }) => ({
  items: many(menuItems),
}))

export const menuItemRelations = relations(menuItems, ({ one, many }) => ({
  menu: one(menus, {
    fields: [menuItems.menuId],
    references: [menus.id],
  }),
  parent: one(menuItems, {
    fields: [menuItems.parentId],
    references: [menuItems.id],
    relationName: "parentMenuItem",
  }),
  children: many(menuItems, {
    relationName: "parentMenuItem",
  }),
  // Dynamic relations based on type and linkedResourceId
  linkedPost: one(posts, {
    fields: [menuItems.linkedResourceId],
    references: [posts.id],
    relationName: "menuLinkedPost",
  }),
  linkedProduct: one(products, {
    fields: [menuItems.linkedResourceId],
    references: [products.id],
    relationName: "menuLinkedProduct",
  }),
  linkedCategory: one(categories, {
    fields: [menuItems.linkedResourceId],
    references: [categories.id],
    relationName: "menuLinkedCategory",
  }),
  linkedTag: one(tags, {
    fields: [menuItems.linkedResourceId],
    references: [tags.id],
    relationName: "menuLinkedTag",
  }),
}))
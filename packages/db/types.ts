import { users, accounts, sessions, verificationTokens, authenticators, media, categories, tags, posts, products, postTags, productTags, postCategories, productCategories, comments, settings, downloads, meta, orders, orderItems, payments, carts, cartItems, discounts, addresses } from './schema'

export type UserSchema = typeof users.$inferSelect
export type AccountSchema = typeof accounts.$inferSelect
export type SessionSchema = typeof sessions.$inferSelect
export type VerificationTokenSchema = typeof verificationTokens.$inferSelect
export type AuthenticatorSchema = typeof authenticators.$inferSelect
export type MediaSchema = typeof media.$inferSelect
export type CategorySchema = typeof categories.$inferSelect
export type TagSchema = typeof tags.$inferSelect
export type PostSchema = typeof posts.$inferSelect
export type ProductSchema = typeof products.$inferSelect
export type PostTagSchema = typeof postTags.$inferSelect
export type ProductTagSchema = typeof productTags.$inferSelect
export type PostCategorySchema = typeof postCategories.$inferSelect
export type ProductCategorySchema = typeof productCategories.$inferSelect
export type CommentSchema = typeof comments.$inferSelect
export type SettingSchema = typeof settings.$inferSelect
export type DownloadSchema = typeof downloads.$inferSelect
export type MetaSchema = typeof meta.$inferSelect
export type OrderSchema = typeof orders.$inferSelect
export type OrderItemSchema = typeof orderItems.$inferSelect
export type PaymentSchema = typeof payments.$inferSelect
export type CartSchema = typeof carts.$inferSelect
export type CartItemSchema = typeof cartItems.$inferSelect
export type DiscountSchema = typeof discounts.$inferSelect
export type AddressSchema = typeof addresses.$inferSelect


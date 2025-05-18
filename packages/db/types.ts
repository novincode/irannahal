import { users, accounts, sessions, verificationTokens, authenticators } from './schema'

export type UserSchema = typeof users.$inferSelect
export type AccountSchema = typeof accounts.$inferSelect
export type SessionSchema = typeof sessions.$inferSelect
export type VerificationTokenSchema = typeof verificationTokens.$inferSelect
export type AuthenticatorSchema = typeof authenticators.$inferSelect

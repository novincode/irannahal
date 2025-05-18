import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import type { UserRole } from "@db/schema";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

import NextAuth, {  type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getUser, getUserByPhone } from "@actions/users";

export const authOptions: NextAuthConfig = {
  adapter: DrizzleAdapter(db),
  providers: [
    Google,
    Credentials({
      id: "phone",
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        userId: { label: "User ID", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone && !credentials?.userId) {
          return null
        }

        try {
          let user = null
          
          // First, try to find user by ID if provided
          if (credentials?.userId) {
            user = await getUser(credentials.userId as string)
          }
          
          // If no user found by ID, try to find by phone number
          if (!user && credentials?.phone) {
            user = await getUserByPhone(credentials.phone as string)
          }
          
          // If still no user found, this shouldn't happen in our flow
          // but let's be safe and return null
          if (!user) {
            console.warn("Phone auth failed: No user found", { 
              phone: credentials?.phone, 
              userId: credentials?.userId 
            })
            return null
          }

          // Return user data for NextAuth
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error("Phone auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Replace the domain of the redirect URL with NEXT_PUBLIC_APP_URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || baseUrl;
      
      try {
        const target = new URL(url, baseUrl);
        const appBase = new URL(appUrl);
        target.host = appBase.host;
        target.protocol = appBase.protocol;
        
        // If redirecting to /panel, redirect to /panel/dashboard instead
        if (target.pathname === '/panel') {
          target.pathname = '/panel/dashboard'
        }
        
        return target.toString();
      } catch {
        // Default redirect to dashboard
        return `${appUrl}/panel/dashboard`;
      }
    },


    async session({ session, token }) {
      // Attach user fields from DB to session.user
      if (session.user && token?.id) {
        const dbUser = await getUser(token.id as string);
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).role = dbUser.role;
          (session.user as any).phone = dbUser.phone;
          session.user.name = dbUser.name ?? undefined;
          session.user.email = dbUser.email || "";
          session.user.image = dbUser.image ?? undefined;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // On sign in, merge user fields into token
      if (user) {
        const dbUser = await getUser(user.id as string);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role as any;
          token.name = dbUser.name ?? undefined;
          token.email = dbUser.email || "";
          token.image = dbUser.image ?? undefined;
        }
      }
      return token;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

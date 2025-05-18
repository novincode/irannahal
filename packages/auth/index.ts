import NextAuth, {  type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getUser } from "@actions/users";

export const authOptions: NextAuthConfig = {
  adapter: DrizzleAdapter(db),
  providers: [Google],
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
        return target.toString();
      } catch {
        return appUrl;
      }
    },


    async session({ session, token }) {
      // Attach user fields from DB to session.user
      if (session.user && token?.id) {
        const dbUser = await getUser(token.id as string);
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role as any;
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

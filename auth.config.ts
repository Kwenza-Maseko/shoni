import type { NextAuthConfig } from "next-auth"

const SESSION_SECONDS = 2 * 60 * 60

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: SESSION_SECONDS,
    updateAge: SESSION_SECONDS,
  },
  pages: { signIn: "/sign-in" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.role = user.role
        token.loginAt = Date.now()
      }

      if (
        !token.loginAt ||
        Date.now() - (token.loginAt as number) > SESSION_SECONDS * 1000
      ) {
        return null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    },
  },
} satisfies NextAuthConfig
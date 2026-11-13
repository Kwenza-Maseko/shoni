import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/database/drizzle"
import { eq } from "drizzle-orm"
import { compare, hashSync } from "bcryptjs"
import { users } from "@/database/schema"
import { verifyLoginCode } from "@/lib/login-code"
import { getClientIp, rateLimit } from "@/lib/rate-limiting" 
import { authConfig } from "./auth.config"

const DUMMY_HASH = hashSync("not-a-real-password", 12)

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "User Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Code", type: "text" },
      },

      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase()
        const password = credentials?.password?.toString()
        const code = credentials?.code?.toString()
        if (!email || !password || !code) return null

        const ip = await getClientIp()
        const [byEmail, byIp] = await Promise.all([
          rateLimit(`auth:email:${email}`, 10, 900),
          rateLimit(`auth:ip:${ip}`, 20, 900),
        ])
        if (!byEmail.ok || !byIp.ok) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)

        const valid = await compare(password, user?.password ?? DUMMY_HASH)
        if (!user || !valid) return null

        if (!user.emailVerified) return null

        const codeOk = await verifyLoginCode(user.id.toString(), "login", code)
        if (!codeOk) return null

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role ?? "user",
        }
      },
    }),
  ],
  pages: { signIn: "/sign-in" },
  
})
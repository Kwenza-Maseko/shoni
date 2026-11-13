// lib/login-code.ts
import { createHmac, randomInt, timingSafeEqual } from "crypto"
import { and, desc, eq, isNull, gt, sql } from "drizzle-orm"
import { db } from "@/database/drizzle"
import { loginCodes } from "@/database/schema"

export type CodePurpose = "login" | "verify"

const CODE_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

const hashCode = (purpose: CodePurpose, userId: string, code: string) =>
  createHmac("sha256", process.env.AUTH_SECRET!)
    .update(`${purpose}:${userId}:${code}`)
    .digest("hex")

export async function createLoginCode(
  userId: string,
  purpose: CodePurpose
): Promise<{ code: string } | { error: "cooldown" }> {
  const [latest] = await db
    .select()
    .from(loginCodes)
    .where(and(eq(loginCodes.userId, userId), eq(loginCodes.purpose, purpose)))
    .orderBy(desc(loginCodes.createdAt))
    .limit(1)

  if (latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return { error: "cooldown" }
  }

  await db
    .delete(loginCodes)
    .where(
      and(
        eq(loginCodes.userId, userId),
        eq(loginCodes.purpose, purpose),
        isNull(loginCodes.consumedAt)
      )
    )

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0")

  await db.insert(loginCodes).values({
    userId,
    purpose,
    codeHash: hashCode(purpose, userId, code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  })

  return { code }
}

export async function verifyLoginCode(
  userId: string,
  purpose: CodePurpose,
  code: string
) {
  if (!/^\d{6}$/.test(code)) return false

  const [row] = await db
    .select()
    .from(loginCodes)
    .where(
      and(
        eq(loginCodes.userId, userId),
        eq(loginCodes.purpose, purpose),
        isNull(loginCodes.consumedAt),
        gt(loginCodes.expiresAt, new Date())
      )
    )
    .orderBy(desc(loginCodes.createdAt))
    .limit(1)

  if (!row || row.attempts >= MAX_ATTEMPTS) return false

  await db
    .update(loginCodes)
    .set({ attempts: sql`${loginCodes.attempts} + 1` })
    .where(eq(loginCodes.id, row.id))

  const a = Buffer.from(row.codeHash)
  const b = Buffer.from(hashCode(purpose, userId, code))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false

  const consumed = await db
    .update(loginCodes)
    .set({ consumedAt: new Date() })
    .where(and(eq(loginCodes.id, row.id), isNull(loginCodes.consumedAt)))
    .returning({ id: loginCodes.id })

  return consumed.length === 1
}
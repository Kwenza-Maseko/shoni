import { sql } from "drizzle-orm"
import { headers } from "next/headers"
import { db } from "@/database/drizzle"
import { rateLimits } from "@/database/schema"

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
    const [row] = await db
        .insert(rateLimits)
        .values({
            key,
            count: 1,
            resetAt: sql`now() + (${windowSeconds}::int * interval '1 second')`,
        })
        .onConflictDoUpdate({
            target: rateLimits.key,
            set: {
                count: sql`CASE WHEN ${rateLimits.resetAt} <= now() THEN 1 ELSE ${rateLimits.count} + 1 END`,
                resetAt: sql`CASE WHEN ${rateLimits.resetAt} <= now()
                     THEN now() + (${windowSeconds}::int * interval '1 second')
                     ELSE ${rateLimits.resetAt} END`,
            },
        })
        .returning({ count: rateLimits.count, resetAt: rateLimits.resetAt })

    return {
        ok: row.count <= limit,
        retryAfter: Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)),
    }
}

export async function getClientIp() {
    const h = await headers()
    return (
        h.get("x-real-ip") ??
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown"
    )
}

export const tooMany = (seconds: number) =>
    `Too many attempts. Try again in ${Math.ceil(seconds / 60)} minute(s).`
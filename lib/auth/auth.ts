"use server"

import { signIn } from "@/auth"
import { auth } from "@/auth"
import { db } from "@/database/drizzle"
import { users } from "@/database/schema"
import { AuthCredentails, PublicUser } from "@/types"
import { compare, hash } from "bcryptjs"
import { eq } from "drizzle-orm"
import { sendCode, sendAccountExistsNotice } from "@/lib/mail"
import { createLoginCode, verifyLoginCode } from "@/lib/login-code"
import { getClientIp, rateLimit, tooMany } from "../rate-limiting"

type SignInResult =
    | { success: true; role?: string }
    | { success: false; error: string }

type Result = { success: true } | { success: false; error: string }
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO5uHq7yQ3c0m1v6e0e3Zk8yJZ1k0y1lW"

export const requestLoginCode = async (
    params: Pick<AuthCredentails, "email" | "password">
): Promise<Result> => {
    const email = params.email.trim().toLowerCase()
    const ip = await getClientIp()

    const [byIp, byEmail] = await Promise.all([
        rateLimit(`login-code:ip:${ip}`, 10, 900),
        rateLimit(`login-code:email:${email}`, 5, 900),
    ])
    if (!byIp.ok || !byEmail.ok) {
        return { success: false, error: tooMany(Math.max(byIp.retryAfter, byEmail.retryAfter)) }
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    const valid = await compare(params.password, user?.password ?? DUMMY_HASH)
    if (!user || !valid) return { success: false, error: "Invalid email or password" }

    if (!user.emailVerified) {
        return { success: false, error: "Please verify your email first. Sign up again to get a new code." }
    }

    const result = await createLoginCode(user.id.toString(), "login")
    if ("error" in result) {
        return { success: false, error: "Please wait a minute before requesting another code" }
    }
    await sendCode(user.email, result.code, "login")
    return { success: true }
}

export const signUp = async (params: AuthCredentails): Promise<Result> => {
    const email = params.email.trim().toLowerCase()
    const ip = await getClientIp()

    const [byIp, byEmail] = await Promise.all([
        rateLimit(`signup:ip:${ip}`, 5, 3600),
        rateLimit(`signup:email:${email}`, 3, 3600),
    ])
    if (!byIp.ok || !byEmail.ok) {
        return { success: false, error: tooMany(Math.max(byIp.retryAfter, byEmail.retryAfter)) }
    }

    // Hash first so timing is the same whether or not the email exists
    const hashedPassword = await hash(params.password, 12)

    try {
        const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)

        if (existing?.emailVerified) {
            // Same response as a fresh signup, so the form can't be used to find registered emails
            await sendAccountExistsNotice(email)
            return { success: true }
        }

        let userId: string
        if (existing) {
            // Unverified: whoever proves inbox access next wins, so overwrite the details
            await db
                .update(users)
                .set({ fullName: params.fullName, phoneNumber: params.phoneNumber, password: hashedPassword })
                .where(eq(users.id, existing.id))
            userId = existing.id.toString()
        } else {
            const [created] = await db
                .insert(users)
                .values({
                    fullName: params.fullName,
                    email,
                    phoneNumber: params.phoneNumber,
                    password: hashedPassword,
                })
                .returning({ id: users.id })
            userId = created.id.toString()
        }

        const result = await createLoginCode(userId, "verify")
        if ("code" in result) await sendCode(email, result.code, "verify")
        return { success: true }
    } catch (error: unknown) {
        // Lost a race with a parallel signup for the same email: treat as success
        if ((error as { code?: string })?.code === "23505") return { success: true }
        console.error("Signup error")
        return { success: false, error: "Signup error" }
    }
}

export const verifySignupCode = async (
    params: { email: string; code: string }
): Promise<Result> => {
    const email = params.email.trim().toLowerCase()
    const ip = await getClientIp()

    const [byIp, byEmail] = await Promise.all([
        rateLimit(`verify:ip:${ip}`, 10, 900),
        rateLimit(`verify:email:${email}`, 10, 900),
    ])
    if (!byIp.ok || !byEmail.ok) {
        return { success: false, error: tooMany(Math.max(byIp.retryAfter, byEmail.retryAfter)) }
    }

    const fail = { success: false, error: "Invalid or expired code" } as const

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user || user.emailVerified) return fail

    if (!(await verifyLoginCode(user.id.toString(), "verify", params.code))) return fail

    await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id))
    return { success: true }
}

export const resendVerificationCode = async (rawEmail: string): Promise<Result> => {
    const email = rawEmail.trim().toLowerCase()
    const ip = await getClientIp()

    const [byIp, byEmail] = await Promise.all([
        rateLimit(`resend:ip:${ip}`, 10, 3600),
        rateLimit(`resend:email:${email}`, 5, 3600),
    ])
    if (!byIp.ok || !byEmail.ok) {
        return { success: false, error: tooMany(Math.max(byIp.retryAfter, byEmail.retryAfter)) }
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (user && !user.emailVerified) {
        const result = await createLoginCode(user.id.toString(), "verify")
        if ("code" in result) await sendCode(email, result.code, "verify")
    }
    return { success: true } // always the same answer
}

export const signInWithCredentials = async (
    params: Pick<AuthCredentails, "email" | "password"> & { code: string }
): Promise<SignInResult> => {
    try {
        await signIn("credentials", {
            email: params.email,
            password: params.password,
            code: params.code,
            redirect: false,
        })
        const session = await auth()
        if (session?.user?.id) updateLastLogin(session.user.id).catch(console.error)
        return { success: true, role: session?.user?.role ?? undefined }
    } catch {
        return { success: false, error: "Invalid or expired code" }
    }
}

export async function updateLastLogin(userId: string) {
    const today = new Date();
    await db
        .update(users)
        .set({ lastLogin: today })
        .where(eq(users.id, userId))
}

export const getUsers = async (): Promise<PublicUser[]> => {
    const session = await auth()
    if (session?.user?.role !== "admin") throw new Error("Forbidden")
    const result = await db
        .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            role: users.role,
            phoneNumber: users.phoneNumber,
            createdAt: users.createdAt,
            lastLogin: users.lastLogin,
        })
        .from(users)
        .limit(100)

    return result.map((row) => ({
        ...row,
        lastLogin: row.lastLogin ? new Date(row.lastLogin) : null,
    }))
}

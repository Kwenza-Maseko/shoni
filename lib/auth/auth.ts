"use server"

import { signIn } from "@/auth"
import { auth } from "@/auth"
import { db } from "@/database/drizzle"
import { users } from "@/database/schema"
import { AuthCredentails, PublicUser } from "@/types"
import { hash } from "bcryptjs"
import { eq } from "drizzle-orm"

type SignInResult =
    | { success: true; role?: string }
    | { success: false; error: string }

export const signInWithCredentials = async (
    params: Pick<AuthCredentails, "email" | "password">
): Promise<SignInResult> => {
    try {
        const { email, password } = params

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            return { success: false, error: result.error }
        }

        const session = await auth()

        if (session?.user?.id) {
            updateLastLogin(session.user.id).catch(console.error)
        }

        return {
            success: true,
            role: session?.user?.role ?? undefined,
        }
    } catch (error) {
        console.error("Signin error:", error)
        return { success: false, error: "Signin error" }
    }
}

export const signUp = async (params: AuthCredentails) => {
    const { fullName, email, password, phoneNumber } = params
    const hashedPassword = await hash(password, 10)

    try {
        await db.insert(users).values({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
        })

        await signInWithCredentials({ email, password })
        return { success: true }
    } catch (error: unknown) {
        const dbError = error as { code?: string }

        if (dbError?.code === "23505") {
            return { success: false, error: "User already exists" }
        }

        console.error("Signup error:", error)
        return { success: false, error: "Signup error" }
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
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { shoniAccount } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json(
            {
                success: false,
                message: "Not signed in",
            },
            {
                status: 401,
            }
        );
    }

    try {
        const [account] = await db
            .select({
                id: shoniAccount.id,
                loanerId: shoniAccount.loanerId,
                amount: shoniAccount.amount,
            })
            .from(shoniAccount)
            .where(eq(shoniAccount.loanerId, session.user.id))
            .limit(1);

        if (!account) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Shoni account not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: account,
        });
    } catch (error) {
        console.error("Get Shoni Account Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch shoni account",
            },
            {
                status: 500,
            }
        );
    }
}
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { shoniAccount } from "@/database/schema";
import { eq } from "drizzle-orm";


export async function PATCH(req: Request) {
    try {
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

        if (session.user.role !== "LOANER") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only loaners can subtract money from their Shoni account",
                },
                {
                    status: 403,
                }
            );
        }

        const { amount } = await req.json();

        const subtractAmount = Number(amount);

        if (!Number.isFinite(subtractAmount) || subtractAmount <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Amount must be greater than 0",
                },
                {
                    status: 400,
                }
            );
        }

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

        const currentAmount = Number(account.amount);

        if (subtractAmount > currentAmount) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Insufficient account balance",
                },
                {
                    status: 400,
                }
            );
        }

        const updatedAmount = currentAmount - (subtractAmount + 1);

        const [updatedAccount] = await db
            .update(shoniAccount)
            .set({
                amount: updatedAmount.toFixed(2),
            })
            .where(eq(shoniAccount.id, account.id))
            .returning({
                id: shoniAccount.id,
                loanerId: shoniAccount.loanerId,
                amount: shoniAccount.amount,
            });

        return NextResponse.json({
            success: true,
            message: "Amount subtracted successfully",
            data: updatedAccount,
        });
    } catch (error) {
        console.error("Subtract Shoni account amount error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to subtract amount from Shoni account",
            },
            {
                status: 500,
            }
        );
    }
}
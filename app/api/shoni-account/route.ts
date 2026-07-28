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
                    message: "Only loaners can add money to their Shoni account",
                },
                {
                    status: 403,
                }
            );
        }

        const { amount } = await req.json();

        const newAmount = Number(amount);

        if (!Number.isFinite(newAmount) || newAmount <= 0) {
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

        const updatedAmount = currentAmount + newAmount;

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
            message: "Shoni account updated successfully",
            data: updatedAccount,
        });
    } catch (error) {
        console.error("Update Shoni account error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update Shoni account",
            },
            {
                status: 500,
            }
        );
    }
}



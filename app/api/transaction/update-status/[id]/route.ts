

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { loans } from "@/database/schema";
import { and, eq } from "drizzle-orm";

const VALID_STATUSES = ["ACTIVE", "GRACE_PERIOD", "DEFAULTED", "PAID"] as const;
type LoanStatus = (typeof VALID_STATUSES)[number];

const isValidStatus = (value: unknown): value is LoanStatus =>
    typeof value === "string" && (VALID_STATUSES as readonly string[]).includes(value);

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { status, interestStage, cachedAmountOwed, graceEndsAt } = body as {
            status: unknown;
            interestStage?: number;
            cachedAmountOwed?: string;
            graceEndsAt?: string | null;
        };

        if (!isValidStatus(status)) {
            return NextResponse.json(
                { success: false, message: "Invalid status value" },
                { status: 400 }
            );
        }

        const updateValues: Record<string, unknown> = {
            LoanStatus: status,
            paidAt: status === "PAID" ? new Date() : null,
            updatedAt: new Date(),
        };

        if (typeof interestStage === "number") {
            updateValues.interestStage = interestStage;
        }

        if (typeof cachedAmountOwed === "string") {
            updateValues.cachedAmountOwed = cachedAmountOwed;
        }

        if (graceEndsAt !== undefined) {
            updateValues.graceEndsAt = graceEndsAt ? new Date(graceEndsAt) : null;
        }

        const [updated] = await db
            .update(loans)
            .set(updateValues)
            .where(and(eq(loans.id, id), eq(loans.loanerId, session.user.id)))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { success: false, message: "Loan not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, loan: updated });
    } catch (error) {
        console.error("Update Loan Status Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update loan status" },
            { status: 500 }
        );
    }
}
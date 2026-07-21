import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { loans } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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
        const { status } = body as { status: unknown };

        if (!isValidStatus(status)) {
            return NextResponse.json(
                { success: false, message: "Invalid status value" },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(loans)
            .set({
                LoanStatus: status,
                paidAt: status === "PAID" ? new Date() : null,
                updatedAt: new Date(),
            })
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

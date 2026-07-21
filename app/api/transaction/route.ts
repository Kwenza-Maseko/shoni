import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { users, loans } from "@/database/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    try {
        const status = req.nextUrl.searchParams.get("status");

        const VALID_STATUSES = ["ACTIVE", "GRACE_PERIOD", "DEFAULTED", "PAID"] as const;
        const isValidStatus = (value: string | null): value is (typeof VALID_STATUSES)[number] =>
            !!value && (VALID_STATUSES as readonly string[]).includes(value);

        const whereClause = isValidStatus(status)
            ? and(eq(loans.loanerId, session.user.id), eq(loans.LoanStatus, status))
            : eq(loans.loanerId, session.user.id);

        const items = await db
            .selectDistinct({
                id: loans.id,
                loanerId: loans.loanerId,
                loaneeId: loans.loaneeId,
                loaneeName: users.fullName,
                loaneePhoneNumber: users.phoneNumber,
                principle: loans.principal,
                baseInterestRate: loans.baseInterestRate,
                interestStage: loans.interestStage,
                cachedAmountOwed: loans.cachedAmountOwed,
                loanStatus: loans.LoanStatus,
                takenAt: loans.takenAt,
                dueDate: loans.dueAt,
                gracePeriod: loans.graceEndsAt,
                paidAt: loans.paidAt,
                createAt: loans.createdAt,
                updatedAt: loans.updatedAt,
            })
            .from(loans)
            .innerJoin(users, eq(loans.loaneeId, users.id))
            .where(whereClause);

        return NextResponse.json(items);
    } catch (error) {
        console.error("Get Loan Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch Loan" },
            { status: 500 }
        );
    }
}

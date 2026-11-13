
import { db } from "@/database/drizzle";
import { loans, notifications, users } from "@/database/schema";
import { eq, and, sql } from "drizzle-orm";

export async function generateLoanNotifications() {

    const upcomingLoans = await db
        .select({
            id: loans.id,
            loanerId: loans.loanerId,
            loaneeName: users.fullName,
            amount: loans.cachedAmountOwed,
        })
        .from(loans)
        .innerJoin(users, eq(loans.loaneeId, users.id))
        .where(
            and(
                eq(loans.LoanStatus, "ACTIVE"),
                sql`${loans.dueAt}::date =
                (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg')::date + 2`,
                sql`${loans.cachedAmountOwed} > 0`
            )
        );

    for (const loan of upcomingLoans) {
        await db
            .insert(notifications)
            .values({
                loanId: loan.id,
                recipientId: loan.loanerId,
                type: "UPCOMING",
                title: "Upcoming Loan Repayment",
                message: `${loan.loaneeName}'s loan repayment of R${loan.amount} is due in 2 days.`,
            })
            .onConflictDoNothing();
    }


    const graceLoans = await db
        .select({
            id: loans.id,
            loanerId: loans.loanerId,
            loaneeName: users.fullName,
            amount: loans.cachedAmountOwed,
        })
        .from(loans)
        .innerJoin(users, eq(loans.loaneeId, users.id))
        .where(eq(loans.LoanStatus, "GRACE_PERIOD"));

    for (const loan of graceLoans) {
        await db
            .insert(notifications)
            .values({
                loanId: loan.id,
                recipientId: loan.loanerId,
                type: "GRACE_PERIOD",
                title: "Loan Entered Grace Period",
                message: `${loan.loaneeName}'s loan of R${loan.amount} has entered the grace period.`,
            })
            .onConflictDoNothing();
    }

    const defaultedLoans = await db
        .select({
            id: loans.id,
            loanerId: loans.loanerId,
            loaneeName: users.fullName,
            amount: loans.cachedAmountOwed,
        })
        .from(loans)
        .innerJoin(users, eq(loans.loaneeId, users.id))
        .where(eq(loans.LoanStatus, "DEFAULTED"));

    for (const loan of defaultedLoans) {
        await db
            .insert(notifications)
            .values({
                loanId: loan.id,
                recipientId: loan.loanerId,
                type: "DEFAULTED",
                title: "Loan Defaulted",
                message: `${loan.loaneeName}'s loan of R${loan.amount} has defaulted.`,
            })
            .onConflictDoNothing();
    }

    return {
        upcoming: upcomingLoans.length,
        gracePeriod: graceLoans.length,
        defaulted: defaultedLoans.length,
    };
}
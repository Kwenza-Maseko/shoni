import { db } from "@/database/drizzle";
import { loans } from "@/database/schema";
import { auth } from "@/auth";

interface CreateLoanBody {
    loaneeId: string;
    principal: string;
    baseInterestRate?: string;
    takenAt: string;
}
const LOAN_TERM_DAYS = 30;

const calculateDueAt = (takenAt: Date): Date => {
    const dueAt = new Date(takenAt);
    dueAt.setDate(dueAt.getDate() + (LOAN_TERM_DAYS - 1));
    return dueAt;
};

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json(
                { success: false, message: "Not signed in" },
                { status: 401 }
            );
        }

        if (session.user.role && session.user.role !== "LOANER") {
            return Response.json(
                { success: false, message: "Only loaners can add loanees" },
                { status: 403 }
            );
        }



        const body: CreateLoanBody = await req.json();
        const {
            loaneeId,
            principal,
            baseInterestRate,
            takenAt,
        } = body;

        const takenAtDate = new Date(takenAt);
        const dueAtDate = calculateDueAt(takenAtDate);
        
        if (!principal || !takenAt) {
            return Response.json(
                {
                    success: false,
                    message:
                        "principal and takenAt are required",
                },
                { status: 400 }
            );
        }

        const intPrincipal = parseInt(principal);
        const intBaseInterestRate = parseInt(baseInterestRate ?? "40.00", 10);

        const amountOwed = (intPrincipal * intBaseInterestRate / 100) + intPrincipal;

        const [newLoan] = await db
            .insert(loans)
            .values({
                loanerId: session.user.id,
                loaneeId,
                principal,
                baseInterestRate: baseInterestRate ?? "40.00",
                interestStage: 1,
                cachedAmountOwed: amountOwed.toString(),
                LoanStatus: "ACTIVE",
                takenAt: takenAtDate,
                dueAt: dueAtDate,
            })
            .returning();

        return Response.json(
            { success: true, loan: newLoan },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create Loan Error:", error);

        if (
            error instanceof Error &&
            error.message.includes("duplicate key")
        ) {
            return Response.json(
                { success: false, message: "Can not create a loan for this user" },
                { status: 409 }
            );
        }

        return Response.json({ success: false }, { status: 500 });
    }
}
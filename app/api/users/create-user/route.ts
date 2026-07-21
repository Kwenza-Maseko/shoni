import { db } from "@/database/drizzle";
import { users, loans } from "@/database/schema";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

interface CreateLoaneeBody {
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
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

        const body: CreateLoaneeBody = await req.json();
        const {
            fullName,
            email,
            phoneNumber,
            password,
            principal,
            baseInterestRate,
            takenAt,
        } = body;

        if (!fullName || !email || !phoneNumber || !principal || !takenAt) {
            return Response.json(
                {
                    success: false,
                    message:
                        "fullName, email, phoneNumber, principal and takenAt are required",
                },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(password || "Password123!", 10);

        const [newLoanee] = await db
            .insert(users)
            .values({
                fullName,
                email,
                password: passwordHash,
                phoneNumber,
                role: "LOANEE",
            })
            .returning({
                id: users.id,
                fullName: users.fullName,
                email: users.email,
                role: users.role,
                phoneNumber: users.phoneNumber,
                createdAt: users.createdAt,
                lastLogin: users.lastLogin,
            });

        const numPrincipal = parseFloat(principal);
        const numBaseInterestRate = parseFloat(baseInterestRate ?? "40.00");

        const amountOwed = (
            numPrincipal * (numBaseInterestRate / 100) + numPrincipal
        ).toFixed(2);

        const takenAtDate = new Date(takenAt);
        const dueAtDate = calculateDueAt(takenAtDate);

        const [newLoan] = await db
            .insert(loans)
            .values({
                loanerId: session.user.id,
                loaneeId: newLoanee.id,
                principal,
                baseInterestRate: baseInterestRate ?? "40.00",
                interestStage: 1,
                cachedAmountOwed: amountOwed,
                LoanStatus: "ACTIVE",
                takenAt: takenAtDate,
                dueAt: dueAtDate,
            })
            .returning();

        return Response.json(
            { success: true, loanee: newLoanee, loan: newLoan },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create Loanee Error:", error);

        if (
            error instanceof Error &&
            error.message.includes("duplicate key")
        ) {
            return Response.json(
                { success: false, message: "A user with this email already exists" },
                { status: 409 }
            );
        }

        return Response.json({ success: false }, { status: 500 });
    }
}



import bcrypt from "bcryptjs";
import { db } from "./database/drizzle";
import { users, loans, payments } from "./database/schema";

const LOANER_ID = "7f3cc54e-e786-44b6-946c-e22a732a1c7f";

const LOANEE_SEED_DATA = [
    { fullName: "Thandeka Nkosi", email: "thandeka.nkosi@example.com", phoneNumber: "0821234501" },
    { fullName: "Sipho Dlamini", email: "sipho.dlamini@example.com", phoneNumber: "0821234502" },
    { fullName: "Naledi Mokoena", email: "naledi.mokoena@example.com", phoneNumber: "0821234503" },
    { fullName: "Bongani Zulu", email: "bongani.zulu@example.com", phoneNumber: "0821234504" },
    { fullName: "Lerato Khumalo", email: "lerato.khumalo@example.com", phoneNumber: "0821234505" },
    { fullName: "Mandla Ndlovu", email: "mandla.ndlovu@example.com", phoneNumber: "0821234506" },
    { fullName: "Zanele Mahlangu", email: "zanele.mahlangu@example.com", phoneNumber: "0821234507" },
    { fullName: "Themba Sithole", email: "themba.sithole@example.com", phoneNumber: "0821234508" },
    { fullName: "Nomvula Radebe", email: "nomvula.radebe@example.com", phoneNumber: "0821234509" },
    { fullName: "Kagiso Molefe", email: "kagiso.molefe@example.com", phoneNumber: "0821234510" },
];

// Helper: days offset from now, returned as a Date
const daysFromNow = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
};

async function seed() {
    console.log("Hashing passwords and creating loanee users...");

    const passwordHash = await bcrypt.hash("Password123!", 10);

    const insertedUsers = await db
        .insert(users)
        .values(
            LOANEE_SEED_DATA.map((u) => ({
                fullName: u.fullName,
                email: u.email,
                password: passwordHash,
                phoneNumber: u.phoneNumber,
                role: "LOANEE" as const,
            }))
        )
        .returning({ id: users.id, fullName: users.fullName });

    console.log(`Inserted ${insertedUsers.length} loanee users.`);

    // Split the 10 new users into: 5 paid, 2 grace period, 3 unpaid (active)
    const paidUsers = insertedUsers.slice(0, 5);
    const graceUsers = insertedUsers.slice(5, 7);
    const activeUsers = insertedUsers.slice(7, 10);

    const principal = "1000.00";
    const baseInterestRate = "40.00";

    // ---- 5 PAID loans ----
    const paidLoansData = paidUsers.map((u, i) => {
        const takenAt = daysFromNow(-60 - i * 5);
        const dueAt = daysFromNow(-30 - i * 5);
        const paidAt = daysFromNow(-25 - i * 5);
        return {
            loanerId: LOANER_ID,
            loaneeId: u.id,
            principal,
            baseInterestRate,
            interestStage: 1,
            cachedAmountOwed: "0.00",
            LoanStatus: "PAID" as const,
            takenAt,
            dueAt,
            paidAt,
        };
    });

    const insertedPaidLoans = await db
        .insert(loans)
        .values(paidLoansData)
        .returning({ id: loans.id, principal: loans.principal });

    // Corresponding payment records — full amount owed (principal + 40% interest)
    await db.insert(payments).values(
        insertedPaidLoans.map((loan) => ({
            loanId: loan.id,
            amount: (parseFloat(loan.principal) * 1.4).toFixed(2),
            note: "Full repayment",
        }))
    );

    console.log(`Inserted ${insertedPaidLoans.length} PAID loans with matching payments.`);

    // ---- 2 GRACE_PERIOD loans ----
    const graceLoansData = graceUsers.map((u, i) => {
        const takenAt = daysFromNow(-45 - i * 5);
        const dueAt = daysFromNow(-5 - i * 5);
        const graceEndsAt = daysFromNow(5 + i * 3);
        return {
            loanerId: LOANER_ID,
            loaneeId: u.id,
            principal,
            baseInterestRate,
            interestStage: 2,
            cachedAmountOwed: (parseFloat(principal) * 1.4).toFixed(2),
            LoanStatus: "GRACE_PERIOD" as const,
            takenAt,
            dueAt,
            graceEndsAt,
        };
    });

    const insertedGraceLoans = await db
        .insert(loans)
        .values(graceLoansData)
        .returning({ id: loans.id });

    console.log(`Inserted ${insertedGraceLoans.length} GRACE_PERIOD loans.`);

    // ---- 3 ACTIVE (unpaid, not yet due) loans ----
    const activeLoansData = activeUsers.map((u, i) => {
        const takenAt = daysFromNow(-5 - i * 3);
        const dueAt = daysFromNow(25 - i * 3);
        return {
            loanerId: LOANER_ID,
            loaneeId: u.id,
            principal,
            baseInterestRate,
            interestStage: 1,
            cachedAmountOwed: (parseFloat(principal) * 1.4).toFixed(2),
            LoanStatus: "ACTIVE" as const,
            takenAt,
            dueAt,
        };
    });

    const insertedActiveLoans = await db
        .insert(loans)
        .values(activeLoansData)
        .returning({ id: loans.id });

    console.log(`Inserted ${insertedActiveLoans.length} ACTIVE loans.`);

    console.log("Seeding complete.");
}

seed()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
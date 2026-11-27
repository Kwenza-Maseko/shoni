import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { loans } from "@/database/schema";

const isValidDay = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().startsWith(value);

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const promisedPayDate = body?.promisedPayDate;

    if (promisedPayDate !== null && (typeof promisedPayDate !== "string" || !isValidDay(promisedPayDate))) {
        return NextResponse.json({ success: false, message: "Invalid date" }, { status: 400 });
    }

    try {
        const updated = await db
            .update(loans)
            .set({ promisedPayDate, updatedAt: new Date() })
            .where(and(eq(loans.id, id), eq(loans.loanerId, session.user.id)))
            .returning({ id: loans.id });

        if (updated.length === 0) {
            return NextResponse.json({ success: false, message: "Loan not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save promised date", error);
        return NextResponse.json({ success: false, message: "Failed to save date" }, { status: 500 });
    }
}
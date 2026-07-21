
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { users, loans } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    try {
        const items = await db
            .selectDistinct({
                id: users.id,
                fullName: users.fullName,
                email: users.email,
                role: users.role,
                phoneNumber: users.phoneNumber,
                createdAt: users.createdAt,
                lastLogin: users.lastLogin,
            })
            .from(users)
            .innerJoin(loans, eq(loans.loaneeId, users.id))
            .where(eq(loans.loanerId, session.user.id));

        return NextResponse.json(items);
    } catch (error) {
        console.error("Get Users Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
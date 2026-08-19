
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { bank } from "@/database/schema";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    try {
        const items = await db
            .select({
                id: bank.id,
                bankName: bank.bankName,
            })
            .from(bank);

        return NextResponse.json(items);
    } catch (error) {
        console.error("Get Bank Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch bank" },
            { status: 500 }
        );
    }
}
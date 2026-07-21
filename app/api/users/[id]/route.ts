import { db } from "@/database/drizzle";
import { loans, users } from "@/database/schema";
import { auth } from "@/auth"
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
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
                { success: false, message: "Only loaners can update loanees" },
                { status: 403 }
            );
        }

        const { id, phoneNumber } = await req.json();
        await db
            .update(users)
            .set({ phoneNumber })
            .where(eq(users.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update loanee error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update loanee" },
            { status: 500 }
        );
    }
}

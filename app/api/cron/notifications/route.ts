import { generateLoanNotifications } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");

    if (
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const result = await generateLoanNotifications();

        return NextResponse.json({
            success: true,
            result,
        });
    } catch (error) {
        console.error("Notification cron error:", error);

        return NextResponse.json(
            { message: "Notification generation failed" },
            { status: 500 }
        );
    }
}
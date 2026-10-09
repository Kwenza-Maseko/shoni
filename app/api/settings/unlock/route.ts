import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { settings } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
    isKnownSettingsPage,
    UNLOCK_COOKIE_NAME,
    UNLOCK_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/settings-pages";

interface UnlockBody {
    page: string;
    protectionCode: string;
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    try {
        const body: UnlockBody = await req.json();
        const { page, protectionCode } = body;

        if (!page || !isKnownSettingsPage(page) || !protectionCode) {
            return NextResponse.json(
                { success: false, message: "Page and protection code are required" },
                { status: 400 }
            );
        }

        const [pageSetting] = await db
            .select({
                protected: settings.protected,
                protectionPass: settings.protectionPass,
            })
            .from(settings)
            .where(and(eq(settings.loanerId, session.user.id), eq(settings.page, page)))
            .limit(1);

        if (!pageSetting?.protectionPass) {
            return NextResponse.json(
                { success: false, message: "This page has no protection code set" },
                { status: 400 }
            );
        }
        const isMatch = await bcrypt.compare(
            protectionCode,
            pageSetting.protectionPass
        );

        if (!isMatch) {
            return NextResponse.json(
                { success: false, message: "Incorrect protection code" },
                { status: 401 }
            );
        }

        const response = NextResponse.json({
            success: true,
            redirectTo: page,
        });

        response.cookies.set(UNLOCK_COOKIE_NAME, page, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: UNLOCK_COOKIE_MAX_AGE_SECONDS,
        });

        return response;
    } catch (error) {
        console.error("Unlock Settings Page Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to unlock page" },
            { status: 500 }
        );
    }
}
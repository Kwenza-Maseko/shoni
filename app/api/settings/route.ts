import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { settings } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SETTINGS_PAGES, isKnownSettingsPage } from "@/lib/settings-pages";


export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    try {
        const rows = await db
            .select({
                page: settings.page,
                protected: settings.protected,
                protectionPass: settings.protectionPass,
            })
            .from(settings)
            .where(eq(settings.loanerId, session.user.id));

        const byPage = new Map(rows.map((r) => [r.page, r]));

        const result = SETTINGS_PAGES.map(({ path, label }) => {
            const row = byPage.get(path);
            return {
                page: path,
                label,
                protected: row?.protected === "YES",
                hasCode: !!row?.protectionPass,
            };
        });

        return NextResponse.json({ success: true, settings: result });
    } catch (error) {
        console.error("Get Settings Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

interface PatchBody {
    page: string;
    protected: boolean;
    protectionCode?: string; 
}

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    try {
        const body: PatchBody = await req.json();
        const { page, protected: isProtected, protectionCode } = body;

        if (!page || !isKnownSettingsPage(page)) {
            return NextResponse.json(
                { success: false, message: "Unknown settings page" },
                { status: 400 }
            );
        }
        const [existing] = await db
            .select({ protectionPass: settings.protectionPass })
            .from(settings)
            .where(and(eq(settings.loanerId, session.user.id), eq(settings.page, page)))
            .limit(1);

        if (isProtected && !existing?.protectionPass && !protectionCode) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Set a protection code before enabling protection for this page",
                },
                { status: 400 }
            );
        }

        const hashedCode = protectionCode
            ? await bcrypt.hash(protectionCode, 10)
            : undefined;

        await db
            .insert(settings)
            .values({
                loanerId: session.user.id,
                page,
                protected: isProtected ? "YES" : "NO",
                protectionPass: hashedCode ?? null,
            })
            .onConflictDoUpdate({
                target: [settings.loanerId, settings.page],
                set: {
                    protected: isProtected ? "YES" : "NO",
                    ...(hashedCode ? { protectionPass: hashedCode } : {}),
                    updatedAt: new Date(),
                },
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update Settings Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update settings" },
            { status: 500 }
        );
    }
}
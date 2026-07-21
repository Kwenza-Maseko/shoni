import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { settings } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { UNLOCK_COOKIE_NAME } from "@/lib/settings-pages";




export default auth(async (req) => {
    const { nextUrl } = req;
    const session = req.auth;
    const { pathname } = req.nextUrl

    const protectedPrefixes = [
        "/transaction",
        "/categories",
        "/loanees",
        "/settings",
    ]

    const isProtected = protectedPrefixes.some(prefix =>
        pathname.startsWith(prefix)
    )
    if (nextUrl.pathname.startsWith("/") && !session?.user?.id) {
        const signInUrl = new URL("/sign-in", nextUrl);
        signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }

    if (
        !session?.user?.id ||
        !nextUrl.pathname.startsWith("/") ||
        nextUrl.pathname === "/settings/unlock"
    ) {
        return NextResponse.next();
    }

    const unlockedPage = req.cookies.get(UNLOCK_COOKIE_NAME)?.value;

    if (unlockedPage === nextUrl.pathname) {
        return NextResponse.next();
    }

    const [pageSetting] = await db
        .select({
            protected: settings.protected,
            protectionPass: settings.protectionPass,
        })
        .from(settings)
        .where(
            and(
                eq(settings.loanerId, session.user.id),
                eq(settings.page, nextUrl.pathname)
            )
        )
        .limit(1);

    const isEnforced =
        pageSetting?.protected === "YES" && !!pageSetting.protectionPass;

    if (isEnforced) {
        const unlockUrl = new URL("/settings/unlock", nextUrl);
        unlockUrl.searchParams.set("next", nextUrl.pathname);
        return NextResponse.redirect(unlockUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/settings/:path*",
        "/transaction/:path*",
        "/categories/:path*",
        "/loanees/:path*",
    ],
};

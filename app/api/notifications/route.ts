import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { notifications } from "@/database/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userNotifications = await db
            .select()
            .from(notifications)
            .where(
                eq(notifications.recipientId, session.user.id)
            )
            .orderBy(desc(notifications.createdAt));

        const unreadCount = userNotifications.filter(
            (notification) => notification.isRead === 0
        ).length;

        return NextResponse.json({
            notifications: userNotifications,
            unreadCount,
        });

    } catch (error) {
        console.error("FETCH NOTIFICATIONS ERROR:", error);

        return NextResponse.json(
            { message: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { notificationId, isRead } = await request.json();

        if (
            typeof notificationId !== "string" ||
            typeof isRead !== "boolean"
        ) {
            return NextResponse.json(
                { message: "Invalid notification data" },
                { status: 400 }
            );
        }

        const updated = await db
            .update(notifications)
            .set({
                isRead: isRead ? 1 : 0,
            })
            .where(
                and(
                    eq(notifications.id, notificationId),
                    eq(notifications.recipientId, session.user.id)
                )
            )
            .returning();

        if (updated.length === 0) {
            return NextResponse.json(
                { message: "Notification not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            notification: updated[0],
        });

    } catch (error) {
        console.error("UPDATE NOTIFICATION ERROR:", error);

        return NextResponse.json(
            { message: "Failed to update notification" },
            { status: 500 }
        );
    }
}
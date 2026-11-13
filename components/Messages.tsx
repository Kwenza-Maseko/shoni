"use client";

import {
    MessageCircleIcon,
    X,
    Clock,
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
} from "lucide-react";

import { useEffect, useState } from "react";

type Notification = {
    id: string;
    loanId: string;
    recipientId: string;
    type: "UPCOMING" | "GRACE_PERIOD" | "DEFAULTED";
    title: string;
    message: string;
    isRead: number;
    createdAt: string;
};

const Messages = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/notifications", {
                method: "GET",
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error("Unable to fetch notifications");
            }

            const data = await response.json();

            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);

        } catch (error) {
            console.error(error);
            setError("Could not load notifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open]);

    const getNotificationIcon = (type: Notification["type"]) => {
        switch (type) {
            case "UPCOMING":
                return <CalendarClock className="text-blue-500" size={20} />;

            case "GRACE_PERIOD":
                return <Clock className="text-orange-500" size={20} />;

            case "DEFAULTED":
                return <AlertTriangle className="text-red-500" size={20} />;

            default:
                return <MessageCircleIcon size={20} />;
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString("en-ZA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, []);


    const updateNotificationStatus = async (
        notificationId: string,
        isRead: boolean
    ) => {
        try {
            const response = await fetch("/api/notifications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    notificationId,
                    isRead,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update notification");
            }

            // Update the notification immediately in the UI
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, isRead: isRead ? 1 : 0 }
                        : notification
                )
            );

            // Update unread badge
            setUnreadCount((prev) =>
                Math.max(
                    0,
                    prev + (isRead ? -1 : 1)
                )
            );

        } catch (error) {
            console.error("Notification update error:", error);
            setError("Could not update notification.");
            await fetchNotifications();
        }
    };

    return (
        <div className="relative">

            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="relative p-1"
                aria-label="Open notifications"
            >
                <MessageCircleIcon className="w-5 h-5" />

                {unreadCount > 0 && (
                    <span className="absolute -top-1 rounded bg-red-700 px-1.5 text-[7pt] text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30"
                        onClick={() => setOpen(false)}
                    />

                    {/* Panel */}
                    <div className="fixed right-3 top-16 z-50 w-[calc(100%-24px)] max-w-md overflow-hidden rounded-xl border bg-white text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-white">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
                            <div>
                                <h2 className="font-semibold">
                                    Notifications
                                </h2>

                                <p className="text-xs text-gray-500">
                                    {unreadCount} unread notifications
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Notification list */}
                        <div className="max-h-105 overflow-y-auto">

                            {loading && notifications.length === 0 && (
                                <p className="p-6 text-center text-sm text-gray-500">
                                    Loading notifications...
                                </p>
                            )}

                            {error && (
                                <p className="p-6 text-center text-sm text-red-500">
                                    {error}
                                </p>
                            )}

                            {!loading && !error && notifications.length === 0 && (
                                <div className="flex flex-col items-center gap-2 p-8 text-center">
                                    <CheckCircle2
                                        size={35}
                                        className="text-gray-400"
                                    />

                                    <p className="font-medium">
                                        No notifications yet
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        You're all caught up!
                                    </p>
                                </div>
                            )}

                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex gap-3 border-b p-4 transition
            dark:border-gray-800
            hover:bg-gray-50 dark:hover:bg-gray-800
            ${notification.isRead === 0
                                            ? "bg-blue-50/60 dark:bg-blue-950/20"
                                            : ""
                                        }`}
                                >
                                    {/* Notification icon */}
                                    <div className="mt-1 shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Notification content */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (notification.isRead === 0) {
                                                updateNotificationStatus(notification.id, true);
                                            }

                                            // You can add router.push() here
                                            // to open the corresponding loan.
                                        }}
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-semibold">
                                                {notification.title}
                                            </h3>

                                            {notification.isRead === 0 && (
                                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                            )}
                                        </div>

                                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                            {notification.message}
                                        </p>

                                        <p className="mt-2 text-[11px] text-gray-400">
                                            {formatDate(notification.createdAt)}
                                        </p>
                                    </button>

                                    {/* Read / Unread action */}
                                    <button
                                        type="button"
                                        title={
                                            notification.isRead === 0
                                                ? "Mark as read"
                                                : "Mark as unread"
                                        }
                                        onClick={() =>
                                            updateNotificationStatus(
                                                notification.id,
                                                notification.isRead === 0
                                            )
                                        }
                                        className="shrink-0 self-center rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                                    >
                                        {notification.isRead === 0 ? "Read" : "Unread"}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="border-t p-3 text-center dark:border-gray-700">
                            <button
                                type="button"
                                onClick={fetchNotifications}
                                className="text-xs font-medium text-blue-600 hover:underline"
                            >
                                Refresh notifications
                            </button>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default Messages;
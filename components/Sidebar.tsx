"use client";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import {
    PanelRightIcon,
    PanelLeftIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

interface ShoniAccount {
    id: string;
    loanerId: string;
    amount: string;
}

const Sidebar = () => {
    const [isOpened, setIsOpened] = useState(true);
    const [shoniAccount, setShoniAccount] =
        useState<ShoniAccount | null>(null);
    const [loading, setLoading] = useState(true);

    const pathname = usePathname();

    const formatCurrency = (amount: string | number) => {
        return `R${Number(amount).toLocaleString("en-ZA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    useEffect(() => {
        const fetchShoniAccount = async () => {
            try {
                const res = await fetch("/api/shoni-account");

                const data = await res.json();

                if (!res.ok || data?.success === false) {
                    throw new Error(
                        data.message || "Failed to fetch shoni account"
                    );
                }

                setShoniAccount(data.data);
            } catch (err) {
                console.error(err);

                toast.error(
                    "Could not load Shoni account. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchShoniAccount();
    }, []);

    const toggle = () => {
        setIsOpened((prev) => !prev);
    };

    return (
        <div className="relative">
            <div
                className="absolute right-2 top-3.5 cursor-pointer"
                onClick={toggle}
            >
                {isOpened ? (
                    <PanelRightIcon className="w-4 h-4" />
                ) : (
                    <PanelLeftIcon className="w-4 h-4" />
                )}
            </div>

            <div
                className={`${isOpened ? "w-64" : "w-12"
                    } overflow-x-hidden min-h-screen bg-zinc-50 p-2`}
            >
                {isOpened ? (
                    <p className="text-lg font-black">Shoni</p>
                ) : (
                    <p className="text-lg font-black">S</p>
                )}

                <div className="mt-16 rounded-lg w-full h-full">
                    {sidebarLinks.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.id}
                                href={item.url}
                                aria-current={
                                    pathname.startsWith(item.url)
                                        ? "page"
                                        : undefined
                                }
                                className={cn(
                                    "flex items-center gap-2 mb-1 capitalize transition-colors p-2 rounded-md w-full",
                                    pathname === item.url
                                        ? "bg-black font-bold text-white"
                                        : "text-black hover:text-gray-500"
                                )}
                            >
                                <Icon className="w-4 h-4" />

                                {isOpened && (
                                    <p className="capitalize">
                                        {item.name}
                                    </p>
                                )}
                            </Link>
                        );
                    })}
                </div>
                {isOpened && (
                    <div className="mt-5 rounded-md bg-zinc-100 border border-zinc-200 p-4 space-y-4">
                        <p className="text-[11px] uppercase tracking-wide">
                            Shoni Balance
                        </p>

                        {loading ? (
                            <p className="text-sm text-gray-500">
                                R00,0
                            </p>
                        ) : shoniAccount ? (
                            <div>
                                <p className="text-lg font-bold">
                                    {formatCurrency(shoniAccount.amount)}
                                </p>
                                <p className="text-xs text-gray-600">Available Balance</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mt-4">
                                No account found
                            </p>
                        )}
                    </div>)}
            </div>
        </div>
    );
};

export default Sidebar;
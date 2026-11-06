"use client";

import { Crown, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavbarProps {
    name: string;
    email: string;
    role: string;
}

const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
};

const Navbar = ({ name, email, role }: NavbarProps) => {
    const pathname = usePathname();
    const [isOpened, setIsOpened] = useState(false);
    const label =
        pathname === "/"
            ? "Overview"
            : pathname
                .replace("/", "")
                .split("/")
                .filter(Boolean)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" / ");

    return (
        <nav className="fixed left-0 right-0 top-0 z-50 flex justify-between items-center gap-4 border-b border-slate-800 bg-slate-950 px-6">
            <div className="flex gap-3 md:gap-6 items-center">
                <div className="flex gap-3 items-center">
                    <Link
                        href={"/"}
                        className="text-lg font-black">Shoni</Link>
                    <div className="w-1 h-1 rounded-full bg-slate-400" />

                    <div className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-light hidden md:block">
                        v1.0
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-[8pt] font-medium  rounded-full border w-fit bg-amber-50 text-amber-700 border-amber-200 px-2 py-0.5">
                    <Crown className="w-3 h-3" />
                    <span className="hidden md:block">Manage</span>  {label}
                </div>
            </div>

            <div className="flex gap-8 items-center">


                <div className="md:flex gap-8 hidden">
                    {sidebarLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div className="flex gap-2"
                                key={item.id}>
                                <Link
                                    href={item.url}
                                    aria-current={
                                        pathname.startsWith(item.url)
                                            ? "page"
                                            : undefined
                                    }
                                    className={cn(
                                        "flex items-center gap-2 capitalize transition-colors w-full py-4 ",
                                        pathname === item.url
                                            ? "border-b-2 border-blue-400 font-bold text-blue-400"
                                            : "text-slate-100 hover:text-gray-500 "
                                    )}
                                >
                                    <Icon className="w-4 h-4 " />
                                    {item.name}
                                </Link>
                            </div>

                        );
                    })}
                </div>



                <div className="flex gap-3 items-center">
                    <Collapsible>
                        <CollapsibleTrigger>
                            <div className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full p-2 text-xs font-semibold">
                                <p>{getInitials(name)}</p>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg border border-zinc-100 py-1 z-200">
                                <div className="px-3 py-2 border-b border-zinc-100 space-y-1">
                                    <p className="text-sm font-medium text-zinc-900 truncate">{name}</p>
                                    <p className="text-xs text-zinc-500 truncate">{email}</p>
                                    <p className="text-xs text-zinc-400 capitalize">{role}</p>
                                </div>

                                <div className="rounded-md bg-white p-3 w-full">
                                    <Link
                                        href={"/admin/manage-account"}
                                    >
                                        Manage Account
                                    </Link>

                                </div>


                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-zinc-50"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log out
                                </button>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    <Link
                        href={"/settings"}
                        className="rounded-full border border-teal-200 w-8 h-8 flex justify-center items-center"
                    >
                        <Settings className="w-4" />
                    </Link>

                    <div className="md:hidden block space-y-1 py-4 relative"
                        onClick={() => setIsOpened((prev) => !prev)}
                    >
                        <div className="w-4 h-0.5 bg-white" />
                        <div className="w-4 h-0.5 bg-white" />
                        <div className="w-4 h-0.5 bg-white" />



                        {isOpened && (
                            <div className="md:hidden gap-8 block fixed top-0 bottom-0 right-0 left-0 bg-slate-900 p-4">
                                {sidebarLinks.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div className="flex gap-2"
                                            key={item.id}>
                                            <Link
                                                href={item.url}
                                                aria-current={
                                                    pathname.startsWith(item.url)
                                                        ? "page"
                                                        : undefined
                                                }
                                                className={cn(
                                                    "flex items-center gap-2 capitalize transition-colors w-full py-2 text-lg mb-3",
                                                    pathname === item.url
                                                        ? "border-b-2 border-blue-400 font-bold text-blue-400"
                                                        : "text-slate-100 hover:text-gray-500 "
                                                )}
                                            >
                                                <Icon className="w-5 h-5 " />
                                                {item.name}
                                            </Link>
                                        </div>

                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </nav >
    );
};

export default Navbar;
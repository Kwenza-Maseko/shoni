"use client";

import { ChevronUp, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface NavbarProps {
    name: string;
    email: string;
    role: string;
}

const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
};
const PER_PAGE = 10

const Navbar = ({ name, email, role }: NavbarProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    

    return (
        <div className="fixed right-6 top-5 z-50" ref={ref}>
            <div
                className="rounded-full p-0.5 w-14 bg-zinc-200 flex justify-between gap-3 items-center shadow-md cursor-pointer border border-zinc-300 "
                onClick={() => setOpen((prev) => !prev)}
            >
                <div className="bg-amber-500 text-black w-6 h-6 flex items-center justify-center rounded-full p-2 text-xs">
                    <p>{getInitials(name)}</p>
                </div>
                <ChevronUp
                    className={`w-4 h-4 pr-1 transition-transform ${open ? "" : "rotate-180"}`}
                />
            </div>

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-zinc-100 py-1 z-200">
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
            )}
        </div>
    );
};

export default Navbar;
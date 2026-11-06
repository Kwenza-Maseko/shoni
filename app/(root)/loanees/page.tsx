"use client";

import AddLoaneeForm from "@/components/AddLoaneeForm";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from 'next/navigation';
import ViewLoanee from "@/components/ViewLoanee";
import UpdateLoanee from "@/components/UpdateLoanee";
import TakeLoan from "@/components/TakeLoan";
import UserTransactionHistory from "@/components/UserTransactionHistory";
import { Skeleton } from "@/components/ui/skeleton";

interface Loanee {
    id: string;
    fullName: string;
    email: string;
    bankName: string;
    role: "LOANEE" | "LOANER";
    phoneNumber: string;
    createdAt: string;
    lastLogin: string | null;
}

const PAGE_SIZE = 6;

const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getInitials = (name: string) => name.charAt(0).toUpperCase();


export const bankImageUrl = [
    {
        bankName: "Capitec Bank",
        imageUrl: "/banks/capitec.jpeg"
    },
    {
        bankName: "Gotyme Bank",
        imageUrl: "/banks/gotyme_bank.jpeg"
    },
    {
        bankName: "Nedbank Bank",
        imageUrl: "/banks/nedbank.jpeg"
    },
    {
        bankName: "Standard Bank",
        imageUrl: "/banks/standard.jpeg"
    },
    {
        bankName: "FNB Bank",
        imageUrl: "/banks/fnb-logo.jpg"
    },
];

const LoaneesList = () => {
    const pathname = usePathname();
    const [loanees, setLoanees] = useState<Loanee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);


    const label =
        pathname === "/admin"
            ? "Dashboard"
            : pathname
                .replace("/admin", "")
                .split("/")
                .filter(Boolean)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" / ");

    useEffect(() => {
        const fetchLoanees = async () => {
            try {
                const res = await fetch("/api/users");

                if (!res.ok) {
                    throw new Error("Failed to fetch loanees");
                }

                const data = await res.json();

                if (data?.success === false) {
                    throw new Error(data.message || "Failed to fetch loanees");
                }

                setLoanees(data);
            } catch (err) {
                console.error(err);
                setError("Could not load loanees. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchLoanees();
    }, []);

    const filtered = useMemo(() => {
        let data = [...loanees];

        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(
                (o) =>
                    (o.fullName ?? "").toLowerCase().includes(q) ||
                    (o.email ?? "").toLowerCase().includes(q) ||
                    o.phoneNumber.toLowerCase().includes(q)
            );
        }

        return data;
    }, [loanees, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [totalPages, page]);

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    if (loading) {
        return (
            <div className="space-y-4 mt-20">
                <Skeleton className="w-full h-8" />
                <div className="flex w-full flex-col gap-2">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div className="flex gap-4" key={index}>
                            <Skeleton className="h-10 flex-1" />
                            <Skeleton className="h-10 w-34" />
                            <Skeleton className="h-10 w-34" />
                            <Skeleton className="h-10 w-34" />
                            <Skeleton className="h-10 w-34" />
                            <Skeleton className="h-10 w-34" />
                        </div>
                    ))}
                </div>
            </div>

        );
    }

    if (error) {
        return (
            <div className="w-full py-10 text-center text-sm text-red-600">
                {error}
            </div>
        );
    }

    if (loanees.length === 0) {
        return (
            <div className="w-full py-4 text-sm">
                <div className="mb-16 flex gap-6 items-center mt-25">
                    <AddLoaneeForm />
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            className="px-3 py-5 text-sm border border-slate-500 rounded-lg outline-none focus:border-zinc-400 bg-slate-800 transition-colors w-70"
                            placeholder="Search name, email, phone number..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
                No loanees found yet.
            </div>
        );
    }

    return (
        <div className="mt-18">
            <div className="mb-8 flex gap-6 items-center">
                <AddLoaneeForm />
                <div className="flex flex-wrap items-center gap-2">
                    <Input
                        className="px-3 py-5 text-sm border border-slate-500 rounded-lg outline-none focus:border-zinc-400 bg-slate-800 transition-colors w-70"
                        placeholder="Search name, email, phone number..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>
            <div className="w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-700 shadow-lg">

                {filtered.length === 0 ? (
                    <div className="w-full py-10 text-center text-sm text-zinc-500">
                        No loanees match your search.
                    </div>
                ) : (
                    <>
                        <table className="w-full text-xs text-left">
                            <thead className="border-b border-gray-800 bg-gray-800 text-gray-400">
                                <tr>
                                    <th className="px-4 py-3 font-medium uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 font-medium uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 font-medium uppercase tracking-wider">Phone</th>
                                    <th className="px-4 py-3 font-medium uppercase tracking-wider">Bank</th>
                                    <th className="px-4 py-3 font-medium uppercase tracking-wider">Joined</th>
                                    <th className="px-4 py-3 font-medium uppercase tracking-wider">Last Login</th>
                                    <th className="px-4 py-3 font-medium text-end uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((loanee) => (
                                    <tr
                                        key={loanee.id}
                                        className="border-b border-gray-600/60 transition-colors last:border-0 hover:bg-gray-600/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-300 to-amber-600 text-xs font-semibold text-gray-900">
                                                    {getInitials(loanee.fullName)}
                                                </div>
                                                <span className="font-bold text-white">
                                                    {loanee.fullName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">
                                            {loanee.email}
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">
                                            {loanee.phoneNumber}
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">
                                            {(() => {
                                                const bankImage = bankImageUrl.find(
                                                    (bank) =>
                                                        bank.bankName.toLowerCase() ===
                                                        loanee.bankName?.toLowerCase()
                                                );

                                                return (
                                                    <div className="flex items-center gap-2">
                                                        {bankImage && (
                                                            <img
                                                                src={bankImage.imageUrl}
                                                                alt={loanee.bankName ?? "Bank"}
                                                                className="w-14 h-14 object-contain rounded"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">
                                            {formatDate(loanee.createdAt)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">
                                            {formatDate(loanee.lastLogin)}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600 flex gap-4 justify-end items-center h-20">
                                            <div>
                                                <TakeLoan
                                                    id={loanee.id}
                                                    name={loanee.fullName}
                                                />
                                            </div>

                                            <div>
                                                <UpdateLoanee
                                                    id={loanee.id}
                                                    name={loanee.fullName}
                                                    phoneNumber={loanee.phoneNumber}
                                                />
                                            </div>

                                            <div>
                                                <ViewLoanee
                                                    name={loanee.fullName}
                                                    role={loanee.role}
                                                    email={loanee.email}
                                                    phoneNumber={loanee.phoneNumber}
                                                    createdAt={loanee.createdAt}
                                                    lastLogin={loanee.lastLogin || ""}
                                                />
                                            </div>

                                            <div>
                                                <UserTransactionHistory
                                                    id={loanee.id}
                                                    name={loanee.fullName}
                                                    email={loanee.email}
                                                    phoneNumber={loanee.phoneNumber}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex items-center justify-between border-t border-gray-800 bg-gray-800/40 px-4 py-3 text-xs text-gray-400">
                            <span>
                                Showing {(page - 1) * PAGE_SIZE + 1}–
                                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-500 text-gray-200 transition-colors hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-500 disabled:hover:text-gray-200"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <span>
                                    Page <span className="text-white">{page}</span> of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-500 text-gray-200 transition-colors hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-500 disabled:hover:text-gray-200"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoaneesList;
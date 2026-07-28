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

interface Loanee {
    id: string;
    fullName: string;
    email: string;
    role: "LOANEE" | "LOANER";
    phoneNumber: string;
    createdAt: string;
    lastLogin: string | null;
}

const PAGE_SIZE = 10;

const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getInitials = (name: string) => name.charAt(0).toUpperCase();

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
            <div className="w-full py-10 text-center text-sm text-zinc-500">
                Loading loanees...
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
                <p className='tracking-wide uppercase font-bold mb-1'>{label}</p>
                <div className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border w-fit bg-amber-50 text-amber-700 border-amber-200 mb-8">
                    <Crown className="w-3 h-3" />
                    Manage {label}
                </div>
                <div className="mb-8 flex gap-6 items-center">
                    <AddLoaneeForm />
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            className="ml-auto h-7 w-70 text-xs rounded-full py-4.5 px-4"
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
        <div className="mt-4">
            <p className='tracking-wide uppercase font-bold mb-1'>{label}</p>
            <div className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border w-fit bg-amber-50 text-amber-700 border-amber-200 mb-8">
                <Crown className="w-3 h-3" />
                Manage {label}
            </div>
            <div className="mb-8 flex gap-6 items-center">
                <AddLoaneeForm />
                <div className="flex flex-wrap items-center gap-2">
                    <Input
                        className="ml-auto h-7 w-70 text-xs rounded-full py-4.5 px-4"
                        placeholder="Search name, email, phone number..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>
            <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 ">

                {filtered.length === 0 ? (
                    <div className="w-full py-10 text-center text-sm text-zinc-500">
                        No loanees match your search.
                    </div>
                ) : (
                    <>
                        <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Phone</th>
                                    <th className="px-4 py-3 font-medium">Joined</th>
                                    <th className="px-4 py-3 font-medium">Last Login</th>
                                    <th className="px-4 py-3 font-medium text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((loanee) => (
                                    <tr
                                        key={loanee.id}
                                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-xs shrink-0">
                                                    {getInitials(loanee.fullName)}
                                                </div>
                                                <span className="font-medium text-zinc-900">
                                                    {loanee.fullName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">{loanee.email}</td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            {loanee.phoneNumber}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            {formatDate(loanee.createdAt)}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            {formatDate(loanee.lastLogin)}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600 flex gap-3 justify-end items-center h-full">
                                            <TakeLoan
                                                id={loanee.id}
                                                name={loanee.fullName}
                                            />
                                            <UpdateLoanee
                                                id={loanee.id}
                                                name={loanee.fullName}
                                                phoneNumber={loanee.phoneNumber}
                                            />
                                            <ViewLoanee
                                                name={loanee.fullName}
                                                role={loanee.role}
                                                email={loanee.email}
                                                phoneNumber={loanee.phoneNumber}
                                                createdAt={loanee.createdAt}
                                                lastLogin={loanee.lastLogin || ""}
                                            />
                                            <UserTransactionHistory
                                                id={loanee.id}
                                                name={loanee.fullName}
                                                email={loanee.email}
                                                phoneNumber={loanee.phoneNumber}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex items-center justify-between px-6 py-3 border-t border-border text-xs text-zinc-500">
                            <span>
                                Showing {(page - 1) * PAGE_SIZE + 1}–
                                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center justify-center w-6 h-6 rounded-full border border-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <span>
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center justify-center w-6 h-6 rounded-full border border-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50"
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
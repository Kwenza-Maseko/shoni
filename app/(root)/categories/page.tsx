"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUp, ArrowDownIcon, Minus, ChevronLeft, ChevronRight, Crown, ArrowBigDown, ArrowDown01, ChevronDown, MoveDown, MoveUpIcon, MoveDownIcon } from "lucide-react";
import { useTransactionStore } from "@/lib/store/useTransactionStore";
import type { Transcations } from "@/lib/loan-auto-status";
import { getRecentMonthOptions, getLoansByMonthKey, totalLoaned, totalExpectedReturn } from "@/lib/loan-stat";
import { usePathname } from "next/navigation";


const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getInitials = (name: string) => name.charAt(0).toUpperCase();

interface DeltaResult {
    current: number;
    previous: number | null;
    delta: number | null;
    percent: number | null;
}

const DeltaPill = ({ delta, percent }: Pick<DeltaResult, "delta" | "percent">) => {
    if (delta === null) return null;

    return (
        <div
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded border ${delta > 0
                    ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                    : delta < 0
                        ? "text-red-700 bg-red-50 border-red-100"
                        : "text-zinc-600 bg-zinc-50 border-zinc-100"
                }`}
        >
            {delta > 0 ? (
                <MoveUpIcon className="w-4 h-4 shrink-0" strokeWidth={2} />
            ) : delta < 0 ? (
                <MoveDownIcon className="w-4 h-4 shrink-0" strokeWidth={2} />
            ) : (
                <Minus className="w-4 h-4 shrink-0" strokeWidth={2} />
            )}

            <span>
                {percent !== null
                    ? `${Math.abs(percent).toFixed(1)}%`
                    : formatCurrency(Math.abs(delta))}
            </span>

            <span className="text-zinc-600 font-normal whitespace-nowrap">
                vs last month
            </span>
        </div>
    );
};

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: "bg-blue-50 text-blue-700 border-blue-200",
    GRACE_PERIOD: "bg-amber-50 text-amber-700 border-amber-200",
    DEFAULTED: "bg-red-50 text-red-700 border-red-200",
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const MONTHS_BACK = 6;
const PAGE_SIZE = 7;

const MonthlyLoansPanel = () => {
    const { transactions, loading, fetchTransactions, runAutoStatusUpdates } =
        useTransactionStore();
    const pathname = usePathname();

    const label =
        pathname === "/admin"
            ? "Dashboard"
            : pathname
                .replace("/admin", "")
                .split("/")
                .filter(Boolean)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" / ");

    const monthOptions = useMemo(() => getRecentMonthOptions(MONTHS_BACK), []);
    const [selectedKey, setSelectedKey] = useState(
        monthOptions[monthOptions.length - 1]?.key
    );
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchTransactions().then(() => {
            runAutoStatusUpdates();
        });
    }, [fetchTransactions, runAutoStatusUpdates]);

    useEffect(() => {
        setPage(1);
    }, [selectedKey]);

    const selectedIndex = monthOptions.findIndex((m) => m.key === selectedKey);
    const previousKey =
        selectedIndex > 0 ? monthOptions[selectedIndex - 1].key : null;

    const loansThisMonth = useMemo(
        () => getLoansByMonthKey(transactions, selectedKey),
        [transactions, selectedKey]
    );

    const totalPages = Math.max(1, Math.ceil(loansThisMonth.length / PAGE_SIZE));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [totalPages, page]);

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return loansThisMonth.slice(start, start + PAGE_SIZE);
    }, [loansThisMonth, page]);

    const loansPreviousMonth = useMemo(
        () => (previousKey ? getLoansByMonthKey(transactions, previousKey) : []),
        [transactions, previousKey]
    );

    const comparison = useMemo(() => {
        const current = totalLoaned(loansThisMonth);
        const previous = totalLoaned(loansPreviousMonth);

        if (previousKey === null) {
            return { current, previous: null, delta: null, percent: null };
        }

        const delta = current - previous;
        const percent = previous === 0 ? null : (delta / previous) * 100;

        return { current, previous, delta, percent };
    }, [loansThisMonth, loansPreviousMonth, previousKey]);

    const returnComparison = useMemo(() => {
        const current = totalExpectedReturn(loansThisMonth);
        const previous = totalExpectedReturn(loansPreviousMonth);

        if (previousKey === null) {
            return { current, previous: null, delta: null, percent: null };
        }

        const delta = current - previous;
        const percent = previous === 0 ? null : (delta / previous) * 100;

        return { current, previous, delta, percent };
    }, [loansThisMonth, loansPreviousMonth, previousKey]);

    return (
        <div className="">
            <div className="bg-white fixed top-0 w-full">
                <div className="pt-4">
                    <p className='tracking-wide uppercase font-bold mb-1'>{label}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border w-fit bg-amber-50 text-amber-700 border-amber-200 mb-6">
                        <Crown className="w-3 h-3" />
                        Manage {label}
                    </div>
                </div>
            </div>


            <div className="mt-25 flex flex-wrap gap-1.5 p-1 bg-zinc-50 rounded-lg w-fit mb-6 overflow-x-auto">
                {monthOptions.map((m) => (
                    <button
                        key={m.key}
                        onClick={() => setSelectedKey(m.key)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${selectedKey === m.key
                            ? "bg-black text-white"
                            : "text-zinc-600 hover:bg-zinc-100"
                            }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-4 flex-1 min-w-70 p-4 rounded-lg border border-zinc-200 bg-zinc-50 ">
                    <div>
                        <p className="text-xs tracking-wide mb-1">
                            Total Loaned
                        </p>
                        <div className="flex gap-2">
                            <p className="text-2xl font-light text-zinc-900">
                                {formatCurrency(comparison.current)}
                            </p>

                            <DeltaPill delta={comparison.delta} percent={comparison.percent} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-1 min-w-70 p-4 rounded-lg border border-zinc-200 bg-zinc-50 ">
                    <div>
                        <p className="text-xs tracking-wide mb-1">
                            Expected Return
                        </p>

                        <div className="flex gap-2">
                            <p className="text-2xl font-light text-zinc-900">
                                {formatCurrency(returnComparison.current)}
                            </p>

                            <DeltaPill delta={returnComparison.delta} percent={returnComparison.percent} />
                        </div>

                    </div>

                </div>
            </div>

            <div className="w-full overflow-x-auto rounded-lg border border-zinc-200">
                {loading && transactions.length === 0 ? (
                    <div className="w-full py-10 text-center text-sm text-zinc-500">
                        Loading loans...
                    </div>
                ) : loansThisMonth.length === 0 ? (
                    <div className="w-full py-10 text-center text-sm text-zinc-500">
                        No loans were taken in this month.
                    </div>
                ) : (
                    <>
                        <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Loanee</th>
                                    <th className="px-4 py-3 font-medium">Principal</th>
                                    <th className="px-4 py-3 font-medium">Amount Owed</th>
                                    <th className="px-4 py-3 font-medium">Taken At</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((loan) => (
                                    <tr
                                        key={loan.id}
                                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-xs shrink-0">
                                                    {getInitials(loan.loaneeName)}
                                                </div>
                                                <span className="font-medium text-zinc-900">
                                                    {loan.loaneeName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            R{loan.principle}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            R{loan.cachedAmountOwed}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            {formatDate(loan.takenAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${STATUS_STYLES[loan.loanStatus] ??
                                                    "bg-zinc-50 text-zinc-600 border-zinc-200"
                                                    }`}
                                            >
                                                {loan.loanStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 text-xs text-zinc-500">
                            <span>
                                Showing {(page - 1) * PAGE_SIZE + 1}–
                                {Math.min(page * PAGE_SIZE, loansThisMonth.length)} of{" "}
                                {loansThisMonth.length}
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

export default MonthlyLoansPanel;
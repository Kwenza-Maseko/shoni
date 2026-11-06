"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, ChevronLeft, ChevronRight, MoveUpIcon, MoveDownIcon } from "lucide-react";
import { useTransactionStore } from "@/lib/store/useTransactionStore";
import { getRecentMonthOptions, getLoansByMonthKey, totalLoaned, totalExpectedReturn } from "@/lib/loan-stat";

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
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                delta > 0
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : delta < 0
                        ? "border-red-500/30 bg-red-500/10 text-red-300"
                        : "border-gray-500/40 bg-gray-500/10 text-gray-300"
            }`}
        >
            {delta > 0 ? (
                <MoveUpIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            ) : delta < 0 ? (
                <MoveDownIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            ) : (
                <Minus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            )}

            <span>
                {percent !== null
                    ? `${Math.abs(percent).toFixed(1)}%`
                    : formatCurrency(Math.abs(delta))}
            </span>

            <span className="whitespace-nowrap font-normal text-gray-400">
                vs last month
            </span>
        </div>
    );
};

const StatCard = ({
    title,
    result,
}: {
    title: string;
    result: DeltaResult;
}) => (
    <div className="relative min-w-70 flex-1 overflow-hidden rounded-xl border border-gray-800 bg-gray-700 p-5 shadow-lg">
        
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            {title}
        </p>

        <p className="text-3xl font-semibold tracking-tight text-white">
            {formatCurrency(result.current)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <DeltaPill delta={result.delta} percent={result.percent} />
            {result.previous !== null && (
                <span className="text-xs text-gray-400">
                    Last month:{" "}
                    <span className="text-amber-300">
                        {formatCurrency(result.previous)}
                    </span>
                </span>
            )}
        </div>
    </div>
);

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    GRACE_PERIOD: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    DEFAULTED: "bg-red-500/10 text-red-300 border-red-500/30",
    PAID: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

const MONTHS_BACK = 6;
const PAGE_SIZE = 7;

const MonthlyLoansPanel = () => {
    const { transactions, loading, fetchTransactions, runAutoStatusUpdates } =
        useTransactionStore();

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

    const comparison = useMemo<DeltaResult>(() => {
        const current = totalLoaned(loansThisMonth);
        const previous = totalLoaned(loansPreviousMonth);

        if (previousKey === null) {
            return { current, previous: null, delta: null, percent: null };
        }

        const delta = current - previous;
        const percent = previous === 0 ? null : (delta / previous) * 100;

        return { current, previous, delta, percent };
    }, [loansThisMonth, loansPreviousMonth, previousKey]);

    const returnComparison = useMemo<DeltaResult>(() => {
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
        <div>
            {/* Month selector */}
            <div className="mt-25 mb-6 flex w-fit flex-wrap gap-1.5 overflow-x-auto rounded-lg border border-gray-700 bg-gray-800 p-1">
                {monthOptions.map((m) => (
                    <button
                        key={m.key}
                        onClick={() => setSelectedKey(m.key)}
                        className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                            selectedKey === m.key
                                ? "bg-amber-500 text-gray-900 shadow-md shadow-amber-500/20"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Comparison cards */}
            <div className="mb-6 flex flex-wrap gap-4">
                <StatCard title="Total Loaned" result={comparison} />
                <StatCard title="Expected Return" result={returnComparison} />
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-700 shadow-lg">
                {loading && transactions.length === 0 ? (
                    <div className="w-full py-12 text-center text-sm text-gray-400">
                        Loading loans...
                    </div>
                ) : loansThisMonth.length === 0 ? (
                    <div className="w-full py-12 text-center text-sm text-gray-400">
                        No loans were taken in this month.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-gray-800 bg-gray-800 text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3 font-medium uppercase tracking-wider">Loanee</th>
                                        <th className="px-4 py-3 font-medium uppercase tracking-wider">Principal</th>
                                        <th className="px-4 py-3 font-medium uppercase tracking-wider">Amount Owed</th>
                                        <th className="px-4 py-3 font-medium uppercase tracking-wider">Taken At</th>
                                        <th className="px-4 py-3 font-medium uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((loan) => (
                                        <tr
                                            key={loan.id}
                                            className="border-b border-gray-600/60 transition-colors last:border-0 hover:bg-gray-600/50"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-300 to-amber-600 text-xs font-semibold text-gray-900">
                                                        {getInitials(loan.loaneeName)}
                                                    </div>
                                                    <span className="font-bold text-white">
                                                        {loan.loaneeName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-200">
                                                R{loan.principle}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-amber-300">
                                                R{loan.cachedAmountOwed}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">
                                                {formatDate(loan.takenAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                                        STATUS_STYLES[loan.loanStatus] ??
                                                        "border-gray-500/40 bg-gray-500/10 text-gray-300"
                                                    }`}
                                                >
                                                    {loan.loanStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-800 bg-gray-800/40 px-4 py-3 text-xs text-gray-400">
                            <span>
                                Showing {(page - 1) * PAGE_SIZE + 1}–
                                {Math.min(page * PAGE_SIZE, loansThisMonth.length)} of{" "}
                                {loansThisMonth.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-500 text-gray-200 transition-colors hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-500 disabled:hover:text-gray-200"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <span>
                                    Page <span className="text-white">{page}</span> of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-500 text-gray-200 transition-colors hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-500 disabled:hover:text-gray-200"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
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
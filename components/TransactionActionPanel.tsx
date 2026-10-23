import { useEffect, useMemo, useState } from 'react'
import { Input } from './ui/input';
import { ChevronLeft, ChevronRight, PhoneCall } from 'lucide-react';
import StatusDropdown from './StatusDropdown';
import { toast } from 'sonner';
import { useTransactionStore } from '@/lib/store/useTransactionStore';
import Link from 'next/link';
import { siWhatsapp } from 'simple-icons/icons';
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from './ui/checkbox';

interface TransactionActionPanelProps {
    status?: string;
}

const PAGE_SIZE = 5;

const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getInitials = (name: string) => name.charAt(0).toUpperCase();

export const loanStatus = [
    "ACTIVE",
    "GRACE_PERIOD",
    "DEFAULTED",
    "PAID",
];


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

const TransactionActionPanel = ({ status }: TransactionActionPanelProps) => {

    const {
        transactions,
        loading,
        error,
        fetchTransactions,
        runAutoStatusUpdates,
        updateTransactionLocal,
    } = useTransactionStore();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    // remove: const [marked, setMarked] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelected = (id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const selectedTotal = useMemo(
        () =>
            transactions
                .filter((t) => selectedIds.has(t.id))
                .reduce((sum, t) => sum + (Number(t.cachedAmountOwed) || 0), 0),
        [transactions, selectedIds]
    );
    const handleWhatsAppFunction = () => {

    }

    useEffect(() => {
        fetchTransactions().then(() => {
            runAutoStatusUpdates();
        });
    }, [fetchTransactions, runAutoStatusUpdates]);
    useEffect(() => {
        setPage(1);
    }, [status]);

    const filtered = useMemo(() => {
        let data = [...transactions];

        if (status) {
            data = data.filter((t) => t.loanStatus === status);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(
                (o) =>
                    (o.cachedAmountOwed ?? 0).toString().includes(q) ||
                    (o.loaneeName ?? "").toString().toLowerCase().includes(q)
            );
        }

        return data;
    }, [transactions, status, search]);

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

    const handleStatusChange = async (
        loanId: string,
        newStatus: string,
        paidAt: string | null
    ) => {
        const previous = transactions.find(
            (t: { id: string }) => t.id === loanId
        );

        if (!previous) {
            toast.error("Transaction not found");
            return;
        }

        updateTransactionLocal(loanId, {
            loanStatus: newStatus,
            paidAt,
        });

        try {
            const res = await fetch(`/api/transaction/${loanId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data?.message || "Failed to update transaction"
                );
            }
            updateTransactionLocal(loanId, {
                loanStatus: data.loan.LoanStatus,
                paidAt: data.loan.paidAt,
            });

            if (newStatus === "PAID") {
                await addAmount(Number(previous.cachedAmountOwed));

                toast.success(
                    "Loan marked as paid and amount added to Shoni account"
                );
            }
        } catch (error) {
            console.error(error);

            updateTransactionLocal(loanId, previous);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update transaction"
            );
        }
    };

    const handleWhatsAppNumber = (loaneePhoneNumber: string) => {
        return `https://wa.me/27${loaneePhoneNumber.replace(/^0/, "")}`;
    };

    const addAmount = async (amount: number) => {
        const response = await fetch("/api/shoni-account", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to add amount");
        }
        return data;
    };


    const totalOwed = useMemo(
        () => filtered.reduce((sum, t) => sum + (Number(t.cachedAmountOwed) || 0), 0),
        [filtered]
    );

    if (loading) {
        <div className="flex w-full max-w-sm flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
                <div className="flex gap-4" key={index}>
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                </div>
            ))}
        </div>
    }

    if (error) {
        return (
            <div className="w-full py-10 text-center text-sm text-red-600">
                {error}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="w-full py-10 text-center text-sm text-zinc-500">
                No transactions found yet.
            </div>
        );
    }

    return (
        <div className=''>
            {search.trim() && (
                <div className="mb-4 w-full sm:w-64 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                        Total Owing
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-zinc-900">
                            R{totalOwed.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-zinc-500">
                            across {filtered.length} loan{filtered.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            )}

            {selectedIds.size > 0 && (
                <div className="mb-4 w-full sm:w-64 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wide">
                        Marked Total
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-zinc-900">
                            R{selectedTotal.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-zinc-500">
                            across {selectedIds.size} loan{selectedIds.size !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="mt-2 text-xs text-emerald-700 underline"
                    >
                        Clear selection
                    </button>
                </div>
            )}

            <div className="mb-8 flex gap-6 items-center w-full md:w-70">
                <Input
                    className="ml-auto h-7 text-xs rounded-full"
                    placeholder="Search name, email, phone number..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
            </div>

            <div className="w-full overflow-x-auto rounded-lg border border-zinc-200">

                {filtered.length === 0 ? (
                    <div className="w-full py-10 text-center text-sm text-zinc-500">
                        No transactions match your search.
                    </div>
                ) : (
                    <>
                        <table className="w-full text-xs text-left ">
                            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        <Checkbox
                                            checked={paginated.length > 0 && paginated.every((t) => selectedIds.has(t.id))}
                                            onCheckedChange={(checked) =>
                                                setSelectedIds((prev) => {
                                                    const next = new Set(prev);
                                                    paginated.forEach((t) => (checked === true ? next.add(t.id) : next.delete(t.id)));
                                                    return next;
                                                })
                                            }
                                            aria-label="Mark all on this page"
                                        />
                                    </th>
                                    <th className="px-4 py-3 font-medium">Loanee</th>
                                    <th className="px-4 py-3 font-medium">Amount</th>
                                    <th className="px-4 py-3 font-medium">Interest</th>
                                    <th className="px-4 py-3 font-medium">Stage</th>
                                    <th className="px-4 py-3 font-medium">Owing</th>
                                    <th className="px-4 py-3 font-medium">Bank</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Taken At</th>
                                    <th className="px-4 py-3 font-medium">Due At</th>
                                    <th className="px-4 py-3 font-medium">Grace Period</th>
                                    <th className="px-4 py-3 font-medium">Paid At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((trans) => (
                                    <tr
                                        key={trans.id}
                                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                                    >
                                        <td className="px-4 py-3">
                                            <Checkbox
                                                checked={selectedIds.has(trans.id)}
                                                onCheckedChange={(checked) => toggleSelected(trans.id, checked === true)}
                                                aria-label={`Mark ${trans.loaneeName}`}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <div className="bg-black text-white w-7 h-7 flex items-center justify-center rounded-full text-xs shrink-0">
                                                    {getInitials(trans.loaneeName)}
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <span className="font-medium text-zinc-900">
                                                        {trans.loaneeName}
                                                    </span>
                                                    <div className="flex gap-3 items-center ">
                                                        <Link
                                                            href={`tel:${trans.loaneePhoneNumber}`}
                                                            className='text-blue-400 flex gap-0.5 items-center'
                                                        >
                                                            <PhoneCall className='w-3' />
                                                            Call
                                                        </Link>
                                                        <a
                                                            href={handleWhatsAppNumber(trans.loaneePhoneNumber)}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className='text-green-400 flex gap-0.5 items-center'
                                                        >
                                                            <svg
                                                                role="img"
                                                                viewBox="0 0 24 24"
                                                                width="12"
                                                                height="12"
                                                                fill={`#${siWhatsapp.hex}`}
                                                            >
                                                                <path d={siWhatsapp.path} />
                                                            </svg>
                                                            WhatsApp
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            R{trans.principle}
                                        </td>

                                        <td className="px-4 py-3 text-zinc-600">
                                            {trans.baseInterestRate}%
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            {trans.interestStage}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            R{trans.cachedAmountOwed}
                                        </td>

                                        <td className="px-4 py-3 text-zinc-600">
                                            {(() => {
                                                const bankImage = bankImageUrl.find(
                                                    (bank) =>
                                                        bank.bankName.toLowerCase() ===
                                                        trans.bankName?.toLowerCase()
                                                );

                                                return (
                                                    <div className="flex items-center gap-2">
                                                        {bankImage && (
                                                            <img
                                                                src={bankImage.imageUrl}
                                                                alt={trans.bankName ?? "Bank"}
                                                                className="w-14 h-14 object-contain rounded"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            <StatusDropdown
                                                loanId={trans.id}
                                                status={trans.loanStatus as "ACTIVE" | "GRACE_PERIOD" | "DEFAULTED" | "PAID"}
                                                onStatusChange={handleStatusChange}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            {formatDate(trans.takenAt)}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            {formatDate(trans.dueDate)}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            {formatDate(trans.gracePeriod)}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-600">
                                            {formatDate(trans.paidAt)}
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
    )
}

export default TransactionActionPanel
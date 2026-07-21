
"use client";

import { create } from "zustand";
import { computeAutoLoanUpdate, Transcations } from "@/lib/loan-auto-status";

interface TransactionStore {
    transactions: Transcations[];
    loading: boolean;
    error: string | null;
    hasFetched: boolean;
    hasRunAutoUpdate: boolean;

    fetchTransactions: (force?: boolean) => Promise<void>;
    updateTransactionLocal: (id: string, partial: Partial<Transcations>) => void;
    runAutoStatusUpdates: () => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
    transactions: [],
    loading: false,
    error: null,
    hasFetched: false,
    hasRunAutoUpdate: false,

    fetchTransactions: async (force = false) => {
        if (get().hasFetched && !force) return;

        set({ loading: true, error: null });
        try {
            const res = await fetch("/api/transaction");
            if (!res.ok) throw new Error("Failed to fetch transactions");

            const data = await res.json();
            if (data?.success === false) throw new Error(data.message || "Failed to fetch transactions");

            set({ transactions: data, loading: false, hasFetched: true });
        } catch (err) {
            console.error(err);
            set({ error: "Could not load transactions. Please try again.", loading: false });
        }
    },

    updateTransactionLocal: (id, partial) =>
        set((state) => ({
            transactions: state.transactions.map((t) =>
                t.id === id ? { ...t, ...partial } : t
            ),
        })),

    runAutoStatusUpdates: async () => {
        if (get().hasRunAutoUpdate) return;
        set({ hasRunAutoUpdate: true }); 

        const { transactions, updateTransactionLocal } = get();

        const jobs = transactions
            .map((trans) => ({ trans, update: computeAutoLoanUpdate(trans) }))
            .filter((x): x is { trans: Transcations; update: NonNullable<ReturnType<typeof computeAutoLoanUpdate>> } => x.update !== null);

        if (jobs.length === 0) return;

        await Promise.all(
            jobs.map(async ({ trans, update }) => {
                try {
                    const res = await fetch(`/api/transaction/${trans.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            status: update.loanStatus,
                            interestStage: update.interestStage,
                            cachedAmountOwed: update.cachedAmountOwed,
                            graceEndsAt: update.gracePeriod,
                        }),
                    });

                    const data = await res.json();
                    if (!res.ok || !data.success) throw new Error(data?.message);

                    updateTransactionLocal(trans.id, {
                        loanStatus: update.loanStatus,
                        interestStage: String(update.interestStage),
                        cachedAmountOwed: update.cachedAmountOwed,
                        gracePeriod: update.gracePeriod,
                    });
                } catch (err) {
                    console.error(`Auto-update failed for loan ${trans.id}`, err);
                }
            })
        );
    },
}));
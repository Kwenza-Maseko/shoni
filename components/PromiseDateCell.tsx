"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

export type PromiseState = "NONE" | "PROMISED" | "DUE_TODAY" | "MISSED" | "KEPT" | "PAID_LATE";

const toLocalDay = (date: Date) => date.toLocaleDateString("en-CA");

export const getPromiseState = (
    promisedPayDate: string | null | undefined,
    loanStatus: string,
    paidAt: string | null | undefined,
    today: string = toLocalDay(new Date())
): PromiseState => {
    if (!promisedPayDate) return "NONE";

    if (loanStatus === "PAID") {
        if (!paidAt) return "NONE";
        return toLocalDay(new Date(paidAt)) <= promisedPayDate ? "KEPT" : "PAID_LATE";
    }

    if (promisedPayDate < today) return "MISSED";
    if (promisedPayDate === today) return "DUE_TODAY";
    return "PROMISED";
};

const BADGES: Record<Exclude<PromiseState, "NONE">, { label: string; className: string }> = {
    PROMISED: { label: "Promised", className: "border-sky-400/40 bg-sky-400/10 text-sky-300" },
    DUE_TODAY: { label: "Due today", className: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
    MISSED: { label: "Missed", className: "border-red-400/40 bg-red-400/10 text-red-300" },
    KEPT: { label: "Kept", className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
    PAID_LATE: { label: "Paid late", className: "border-orange-400/40 bg-orange-400/10 text-orange-300" },
};

interface PromiseDateCellProps {
    loanId: string;
    promisedPayDate: string | null;
    loanStatus: string;
    paidAt: string | null;
    onSaved: (loanId: string, promisedPayDate: string | null) => void;
}

const PromiseDateCell = ({ loanId, promisedPayDate, loanStatus, paidAt, onSaved }: PromiseDateCellProps) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState("");
    const [saving, setSaving] = useState(false);

    const state = getPromiseState(promisedPayDate, loanStatus, paidAt);

    const startEditing = () => {
        setValue(promisedPayDate ?? "");
        setEditing(true);
    };

    const save = async (next: string | null) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/transaction/${loanId}/promise`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ promisedPayDate: next }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data?.message || "Failed to save date");

            onSaved(loanId, next);
            setEditing(false);
            toast.success(next ? "Promised date saved" : "Promised date removed");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to save date");
        } finally {
            setSaving(false);
        }
    };

    if (editing) {
        return (
            <div className="flex flex-col gap-1.5">
                <input
                    type="date"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    aria-label="Promised pay date"
                    className="rounded-md border border-slate-500 bg-slate-800 px-2 py-1 text-xs text-white scheme-dark"
                />
                <div className="flex gap-3">
                    <button type="button" disabled={saving || !value} onClick={() => save(value)} className="text-emerald-300 disabled:opacity-40">
                        {saving ? "Saving..." : "Save"}
                    </button>
                    {promisedPayDate && (
                        <button type="button" disabled={saving} onClick={() => save(null)} className="text-red-300 disabled:opacity-40">
                            Remove
                        </button>
                    )}
                    <button type="button" disabled={saving} onClick={() => setEditing(false)} className="text-slate-400">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    if (!promisedPayDate) {
        if (loanStatus === "PAID") return <span className="text-slate-500">—</span>;
        return (
            <button type="button" onClick={startEditing} className="flex items-center gap-1 whitespace-nowrap text-slate-400 hover:text-amber-300">
                <CalendarClock className="w-3.5 h-3.5" />
                Set date
            </button>
        );
    }

    return (
        <button type="button" onClick={startEditing} title="Change promised date" className="flex flex-col items-start gap-1">
            {state !== "NONE" && (
                <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${BADGES[state].className}`}>
                    {BADGES[state].label}
                </span>
            )}
            <span className="whitespace-nowrap text-slate-300 text-[9pt]">
                {new Date(`${promisedPayDate}T00:00:00`).toLocaleDateString("en-ZA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })}
            </span>
        </button>
    );
};

export default PromiseDateCell;
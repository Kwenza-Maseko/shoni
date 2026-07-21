"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

const STATUS_OPTIONS = ["ACTIVE", "GRACE_PERIOD", "DEFAULTED", "PAID"] as const;
type LoanStatusValue = (typeof STATUS_OPTIONS)[number];

const STATUS_STYLES: Record<LoanStatusValue, string> = {
    ACTIVE: "bg-blue-50 text-blue-700 border-blue-200",
    GRACE_PERIOD: "bg-amber-50 text-amber-700 border-amber-200",
    DEFAULTED: "bg-red-50 text-red-700 border-red-200",
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface StatusDropdownProps {
    loanId: string;
    status: LoanStatusValue;
    // Called after a successful update so the parent can update its local state
    onStatusChange: (loanId: string, newStatus: LoanStatusValue, paidAt: string | null) => void;
}

const StatusDropdown = ({ loanId, status, onStatusChange }: StatusDropdownProps) => {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
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

    const handleSelect = async (newStatus: LoanStatusValue) => {
        if (newStatus === status) {
            setOpen(false);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/transaction/${loanId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();

            if (!res.ok || data?.success === false) {
                throw new Error(data?.message || "Failed to update status");
            }

            onStatusChange(loanId, newStatus, data.loan.paidAt);
        } catch (err) {
            console.error(err);
            // Keep it simple — swap for a toast if you have one wired up
            alert("Could not update status. Please try again.");
        } finally {
            setSaving(false);
            setOpen(false);
        }
    };

    // PAID loans are a terminal state here — no dropdown, just the badge
    if (status === "PAID") {
        return (
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_STYLES.PAID}`}
            >
                PAID
            </span>
        );
    }

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                disabled={saving}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium disabled:opacity-60 ${STATUS_STYLES[status]}`}
            >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : status}
                {!saving && <ChevronDown className="w-3 h-3" />}
            </button>

            {open && (
                <div className="absolute left-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-zinc-100 py-1 z-50">
                    {STATUS_OPTIONS.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 ${
                                option === status ? "font-semibold text-zinc-900" : "text-zinc-600"
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StatusDropdown;
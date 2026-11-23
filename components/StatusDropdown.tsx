
"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_OPTIONS = [
    "ACTIVE",
    "GRACE_PERIOD",
    "DEFAULTED",
    "PAID",
] as const;

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
    onStatusChange: (
        loanId: string,
        newStatus: LoanStatusValue,
        paidAt: string | null
    ) => void;
}

const StatusDropdown = ({
    loanId,
    status,
    onStatusChange,
}: StatusDropdownProps) => {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSelect = async (newStatus: LoanStatusValue) => {
        if (newStatus === status || saving) {
            setOpen(false);
            return;
        }

        setSaving(true);

        try {
            const res = await fetch(`/api/transaction/${loanId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();

            if (!res.ok || data?.success === false) {
                throw new Error(
                    data?.message || "Failed to update status"
                );
            }

            onStatusChange(
                loanId,
                newStatus,
                data.loan?.paidAt ?? null
            );

        } catch (err) {
            console.error("Status update error:", err);
            alert("Could not update status. Please try again.");
        } finally {
            setSaving(false);
            setOpen(false);
        }
    };

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
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger>
                <button
                    disabled={saving}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8pt] font-medium disabled:opacity-60 ${STATUS_STYLES[status]}`}
                >
                    {saving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <>
                            {status.replace("_", " ")}
                            <ChevronDown className="w-3 h-3" />
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                side="top"
                sideOffset={5}
                className="w-44 z-9999 bg-white border border-gray-200 shadow-xl"
            >
                {STATUS_OPTIONS.map((option) => (
                    <DropdownMenuItem
                        key={option}
                        disabled={saving}
                        onSelect={() => handleSelect(option)}
                        className={`cursor-pointer text-xs ${
                            option === status
                                ? "font-semibold bg-zinc-100"
                                : ""
                        }`}
                    >
                        {option.replace("_", " ")}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default StatusDropdown;

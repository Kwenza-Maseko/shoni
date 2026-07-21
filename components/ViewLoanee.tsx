"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Eye, Mail, Phone, Calendar, Clock, ShieldCheck } from "lucide-react";

interface ViewLoaneeProps {
    name: string;
    phoneNumber: string;
    role: string;
    email: string;
    createdAt: string;
    lastLogin: string | null;
}

const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const formatDateTime = (value: string | null) => {
    if (!value) return "Never logged in";
    return new Date(value).toLocaleString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getInitials = (name: string) => name.charAt(0).toUpperCase();

const ViewLoanee = ({
    name,
    phoneNumber,
    role,
    email,
    createdAt,
    lastLogin,
}: ViewLoaneeProps) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <button
                onClick={() => setOpen(true)}
                className="flex justify-center items-center w-5 h-5 rounded bg-amber-100 hover:bg-amber-200 transition-colors"
                aria-label={`View ${name}`}
            >
                <Eye className="w-3 h-3 text-amber-700" />
            </button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="sr-only">Viewing {name}</DialogTitle>
                </DialogHeader>

                {/* Identity header */}
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                    <div className="bg-black text-white w-12 h-12 flex items-center justify-center rounded-full text-lg font-medium shrink-0">
                        {getInitials(name)}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">{name}</p>
                        <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-zinc-100 text-xs font-medium text-zinc-600 capitalize">
                            <ShieldCheck className="w-3 h-3" />
                            {role.toLowerCase()}
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="py-4 space-y-3.5">
                    <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs text-zinc-400">Email</p>
                            <p className="text-zinc-900 truncate">{email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs text-zinc-400">Phone</p>
                            <p className="text-zinc-900 font-mono">{phoneNumber}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs text-zinc-400">Joined</p>
                            <p className="text-zinc-900">{formatDate(createdAt)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs text-zinc-400">Last login</p>
                            <p className="text-zinc-900">{formatDateTime(lastLogin)}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewLoanee;
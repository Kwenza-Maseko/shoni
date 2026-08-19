'use client'

import { Crown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PageSetting {
    page: string;
    label: string;
    protected: boolean;
    hasCode: boolean;
}
const Settings = () => {
    const pathname = usePathname();
    const label =
        pathname === "/"
            ? "Overview"
            : pathname
                .replace("/", "")
                .split("/")
                .filter(Boolean)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" / ");


    const [pages, setPages] = useState<PageSetting[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog state — open when a page needs a code before protection can be enabled
    const [codeDialogPage, setCodeDialogPage] = useState<PageSetting | null>(null);
    const [codeInput, setCodeInput] = useState("");
    const [savingCode, setSavingCode] = useState(false);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            setPages(data.settings);
        } catch (err) {
            console.error(err);
            toast.error("Could not load settings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const patchPage = async (
        page: string,
        updates: { protected: boolean; protectionCode?: string }
    ) => {
        const res = await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page, ...updates }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.message || "Update failed");
    };

    const handleToggle = async (pageSetting: PageSetting, next: boolean) => {
        // Turning ON without an existing code -> prompt for one first
        if (next && !pageSetting.hasCode) {
            setCodeDialogPage(pageSetting);
            setCodeInput("");
            return;
        }

        // Optimistic update
        setPages((prev) =>
            prev.map((p) => (p.page === pageSetting.page ? { ...p, protected: next } : p))
        );

        try {
            await patchPage(pageSetting.page, { protected: next });
        } catch (err) {
            setPages((prev) =>
                prev.map((p) =>
                    p.page === pageSetting.page ? { ...p, protected: !next } : p
                )
            );
            toast.error(err instanceof Error ? err.message : "Failed to update");
        }
    };

    const handleSaveCode = async () => {
        if (!codeDialogPage) return;

        if (codeInput.trim().length < 4) {
            toast.error("Protection code must be at least 4 characters");
            return;
        }

        setSavingCode(true);
        try {
            await patchPage(codeDialogPage.page, {
                protected: true,
                protectionCode: codeInput.trim(),
            });

            setPages((prev) =>
                prev.map((p) =>
                    p.page === codeDialogPage.page
                        ? { ...p, protected: true, hasCode: true }
                        : p
                )
            );
            setCodeDialogPage(null);
            toast.success(`${codeDialogPage.label} is now protected`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save code");
        } finally {
            setSavingCode(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full py-10 text-center text-sm text-zinc-500">
                Loading settings...
            </div>
        );
    }
    return (
        <div className=''>
            <div className="bg-white fixed top-0 w-full">
                <div className="pt-4">
                    <p className='tracking-wide uppercase font-bold mb-1'>{label}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border w-fit bg-amber-50 text-amber-700 border-amber-200 mb-6">
                        <Crown className="w-3 h-3" />
                        Manage {label}
                    </div>
                </div>
            </div>

            <div className='mt-25'>
                <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-100">
                    {pages.map((p) => (
                        <div
                            key={p.page}
                            className="flex items-center justify-between px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${p.protected ? "bg-emerald-50" : "bg-zinc-100"
                                        }`}
                                >
                                    {p.protected ? (
                                        <Lock className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                        <LockOpen className="w-4 h-4 text-zinc-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-900">{p.label}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {p.hasCode && (
                                    <button
                                        onClick={() => {
                                            setCodeDialogPage(p);
                                            setCodeInput("");
                                        }}
                                        className="text-xs text-zinc-500 hover:text-zinc-800 underline"
                                    >
                                        Change code
                                    </button>
                                )}
                                <button
                                    role="switch"
                                    aria-checked={p.protected}
                                    onClick={() => handleToggle(p, !p.protected)}
                                    className={`w-10 h-5.5 rounded-full transition-colors relative ${p.protected ? "bg-black" : "bg-zinc-200"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform ${p.protected ? "translate-x-5" : "translate-x-0.5"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <Dialog
                    open={!!codeDialogPage}
                    onOpenChange={(next) => {
                        if (!next) setCodeDialogPage(null);
                    }}
                >
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>
                                {codeDialogPage?.hasCode ? "Update" : "Set"} protection code
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-1.5">
                            <Label htmlFor="protectionCode">
                                Protection code for {codeDialogPage?.label}
                            </Label>
                            <Input
                                id="protectionCode"
                                type="password"
                                value={codeInput}
                                onChange={(e) => setCodeInput(e.target.value)}
                                placeholder="At least 4 characters"
                                autoFocus
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCodeDialogPage(null)}
                                disabled={savingCode}
                            >
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleSaveCode} disabled={savingCode}>
                                {savingCode ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default Settings

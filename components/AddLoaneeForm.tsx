"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AddLoaneeFormProps {
    onSuccess?: () => void;
}

interface FormState {
    fullName: string;
    email: string;
    phoneNumber: string;
    bankId: string;
    charges: string;
    principal: string;
    baseInterestRate: string;
    takenAt: string,
}

interface Bank {
    id: string,
    bankName: string,
    charges: string,
}

const INITIAL_STATE: FormState = {
    fullName: "",
    email: "",
    phoneNumber: "",
    bankId: "",
    charges: "",
    principal: "",
    baseInterestRate: "40.00",
    takenAt: "",
};

const AddLoaneeForm = ({ onSuccess }: AddLoaneeFormProps) => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(INITIAL_STATE);
    const [submitting, setSubmitting] = useState(false);
    const [bank, setBank] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBank = async () => {
            setLoading(true)
            try {
                const res = await fetch("/api/bank");
                if (!res.ok) {
                    throw new Error("Failed to fetch loanees");
                }

                const data = await res.json();
                if (data?.success === false) {
                    throw new Error(data.message || "Failed to fetch loanees");
                }

                setLoading(false);
                setBank(data);
            } catch (err) {
                console.error(err);
                toast("Could not load bank. Please try again.");

            } finally {
                setLoading(false);
            }
        };

        fetchBank();
    }, []);


    const handleChange = (field: keyof FormState) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const resetForm = () => {
        setForm(INITIAL_STATE);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !form.fullName.trim() ||
            !form.email.trim() ||
            !form.phoneNumber.trim() ||
            !form.principal.trim() ||
            !form.takenAt.trim()
        ) {
            toast("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/users/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: form.fullName.trim(),
                    email: form.email.trim(),
                    phoneNumber: form.phoneNumber.trim(),
                    bankId: form.bankId,
                    principal: form.principal,
                    baseInterestRate: form.baseInterestRate,
                    takenAt: new Date(form.takenAt).toISOString(),
                }),
            });

            const data = await res.json();

            if (!res.ok || data?.success === false) {
                throw new Error(data?.message || "Failed to add loanee");
            }

            if (data.success) {
                await deductAmount(Number(form.principal), Number(form.charges));
            }

            resetForm();
            setOpen(false);
            onSuccess?.();
        } catch (err) {
            console.error(err);
            toast(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const deductAmount = async (amount: number, charges: number) => {
        const response = await fetch("/api/shoni-account/subtract", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount,
                charges
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to subtract amount");
        }
        return data;
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) resetForm();
            }}
        >
            <DialogTrigger className="bg-blue-500 text-white rounded-md py-2.5 px-3 flex gap-2 items-center">
                <Plus className="w-4 h-4" />
                Add Loanee
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add a new loanee</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="fullName">Full name</Label>
                        <Input
                            id="fullName"
                            value={form.fullName}
                            onChange={handleChange("fullName")}
                            placeholder="Thandeka Nkosi"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange("email")}
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="phoneNumber">Phone number</Label>
                        <Input
                            id="phoneNumber"
                            value={form.phoneNumber}
                            onChange={handleChange("phoneNumber")}
                            placeholder="0821234501"
                            required
                        />
                    </div>


                    <div className="space-y-1.5">
                        <Label htmlFor="bankId">Bank</Label>

                        {loading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading banks...
                            </p>
                        ) : (
                            <select
                                id="bankId"
                                value={form.bankId}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        bankId: e.target.value,
                                    }))
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            >
                                <option value="" disabled>
                                    Select a bank
                                </option>

                                {bank.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.bankName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>


                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="dueAt">Taken date</Label>
                            <Input
                                id="takenAt"
                                type="date"
                                value={form.takenAt}
                                onChange={handleChange("takenAt")}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="principal">Principal (R)</Label>
                            <Input
                                id="principal"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.principal}
                                onChange={handleChange("principal")}
                                placeholder="500.00"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="baseInterestRate">Interest rate (%)</Label>
                            <Input
                                id="baseInterestRate"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.baseInterestRate}
                                onChange={handleChange("baseInterestRate")}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Adding..." : "Add Loanee"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddLoaneeForm;
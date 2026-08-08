"use client";

import { useState } from "react";
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
    principal: string;
    baseInterestRate: string;
    takenAt: string,
}

const INITIAL_STATE: FormState = {
    fullName: "",
    email: "",
    phoneNumber: "",
    principal: "",
    baseInterestRate: "40.00",
    takenAt: "",
};

const AddLoaneeForm = ({ onSuccess }: AddLoaneeFormProps) => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(INITIAL_STATE);
    const [submitting, setSubmitting] = useState(false);

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
                await deductAmount(Number(form.principal));
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


    const deductAmount = async (amount: number) => {
        const response = await fetch("/api/shoni-account/subtract", {
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
            <DialogTrigger className="bg-black text-white rounded-full py-2 px-3 flex gap-2 items-center">
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
'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { PenIcon } from 'lucide-react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface UpdateLoaneeProps {
    id: string,
    name: string,
    phoneNumber: string,
}

const UpdateLoanee = ({ id, name, phoneNumber }: UpdateLoaneeProps) => {
    const [submitting, setSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ id, name, phoneNumber });

    const handleChange = (field: keyof { id: string, name: string, phoneNumber: string }) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !form.phoneNumber.trim()
        ) {
            toast("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: form.id.trim(),
                    phoneNumber: form.phoneNumber.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok || data?.success === false) {
                throw new Error(data?.message || "Failed to update loanee phone number");
            }

            setOpen(false);
        } catch (err) {
            console.error(err);
            toast(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
            }}
        >
            <button
                onClick={() => setOpen(true)}
                className="flex justify-center items-center w-5 h-5 rounded bg-green-100 hover:bg-green-200 transition-colors"
                aria-label={`View ${name}`}
            >
                <PenIcon className="w-3 text-green-700" />
            </button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader className='mb-8'>
                    <DialogTitle>Updating {name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone number</Label>
                        <Input
                            id="phoneNumber"
                            value={form.phoneNumber}
                            onChange={handleChange("phoneNumber")}
                            required
                        />
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
                            {submitting ? "updating..." : "Update Loanee"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateLoanee
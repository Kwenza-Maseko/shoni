'use client'

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Plus } from "lucide-react";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TakeLoanProps {
  id: string,
  name: string
}

interface FormState {
  principal: string;
  baseInterestRate: string;
  takenAt: string;
}

const INITIAL_STATE: FormState = {
  principal: "",
  baseInterestRate: "40.00",
  takenAt: "",
};

const TakeLoan = ({ id, name }: TakeLoanProps) => {

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
      !form.principal.trim() ||
      !form.takenAt.trim()
    ) {
      toast("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/users/take-loan/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loaneeId: id,
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
      toast(`Loan of ${form.principal} was sucessfully granted to ${name}`)
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
      <DialogTrigger className="flex justify-center items-center w-5 h-5 rounded bg-black hover:bg-black/70 transition-colors"
        aria-label={`Grant ${name}`}>
        <Plus className="w-3 text-white" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grant Loan to {name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-1.5 w-full">
            <Label htmlFor="dueAt">Taken date</Label>
            <Input
              id="dueAt"
              type="date"
              value={form.takenAt}
              onChange={handleChange("takenAt")}
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
              {submitting ? `Granting ${form.principal}...` : "Grant Loan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TakeLoan
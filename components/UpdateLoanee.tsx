
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Pen } from "lucide-react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface UpdateLoaneeProps {
  id: string;
  name: string;
  phoneNumber: string;
  aliasname?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

const UpdateLoanee = ({
  id,
  name,
  phoneNumber,
  aliasname = "Update Loanee",
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: UpdateLoaneeProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const [form, setForm] = useState({
    id,
    name,
    phoneNumber,
  });

  const open = controlledOpen ?? internalOpen;

  const setOpen = (next: boolean) => {
    if (onOpenChange) {
      onOpenChange(next);
    } else {
      setInternalOpen(next);
    }
  };

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.phoneNumber.trim()) {
      toast("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: form.id.trim(),
          phoneNumber: form.phoneNumber.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.message || "Failed to update loanee phone number"
        );
      }

      toast.success("Loanee updated successfully");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer flex gap-2 items-center"
          aria-label={`Update ${name}`}
        >
          <Pen className="w-4 text-green-400" />
          <p className="text-green-400">{aliasname}</p>
        </button>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-8">
          <DialogTitle>Updating {name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`phoneNumber-${id}`}>
              Phone number
            </Label>

            <Input
              id={`phoneNumber-${id}`}
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
              {submitting ? "Updating..." : "Update Loanee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateLoanee;

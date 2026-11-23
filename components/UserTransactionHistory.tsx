
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { HistoryIcon } from "lucide-react";

interface UserTransactionHistoryProps {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  aliasname?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

const getInitials = (name: string) =>
  name.charAt(0).toUpperCase();

const UserTransactionHistory = ({
  id,
  name,
  email,
  phoneNumber,
  aliasname = "History",
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: UserTransactionHistoryProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;

  const setOpen = (next: boolean) => {
    if (onOpenChange) {
      onOpenChange(next);
    } else {
      setInternalOpen(next);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer flex gap-2 items-center"
          aria-label={`View history for ${name}`}
        >
          <HistoryIcon className="w-4.5 h-4.5 text-gray-100" />
          <p className="text-gray-100">{aliasname}</p>
        </button>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Transaction history for {name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
          <div className="bg-black text-white w-12 h-12 flex items-center justify-center rounded-full text-lg font-medium shrink-0">
            {getInitials(name)}
          </div>

          <div className="min-w-0">
            <p className="font-bold">
              {name}

              <span className="text-[11px] text-green-900 font-mono mb-0.5 font-medium">
                {" - "}{phoneNumber}
              </span>
            </p>

            <p className="text-xs text-gray-600">
              {email}
            </p>
          </div>
        </div>

        <div>
          <p>Transaction history of {name}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserTransactionHistory;

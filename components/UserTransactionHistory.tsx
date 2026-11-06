import { Calendar, Clock, Eye, HistoryIcon, Mail, PenIcon, Phone, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "recharts";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useTransactionStore } from "@/lib/store/useTransactionStore";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { email } from "zod/v4";


const getInitials = (name: string) => name.charAt(0).toUpperCase();

interface UserTransactionHistoryProps {
    id: string,
    name: string,
    email: string,
    phoneNumber: string
}
const UserTransactionHistory = ({ id, name, email, phoneNumber }: UserTransactionHistoryProps) => {
    const {
        transactions,
        fetchTransactions,
        runAutoStatusUpdates,
        updateTransactionLocal,
    } = useTransactionStore();

    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);




    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <button
                onClick={() => setOpen(true)}
                className="cursor-pointer"
                aria-label={`View ${name}`}
            >
                <HistoryIcon className="w-4.5 h-4.5 text-gray-100" />
            </button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="sr-only">Viewing {name}</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                    <div className="bg-black text-white w-12 h-12 flex items-center justify-center rounded-full text-lg font-medium shrink-0">
                        {getInitials(name)}
                    </div>
                    <div>
                        <p className="font-bold">
                            {name} 
                            <span className="text-[11px] text-green-900 font-mono mb-0.5 font-medium">
                                {" - "}{phoneNumber}</span>
                        </p>
                        <p className=" text-xs text-gray-600">{email}</p>
                    </div>
                </div>


                <div>
                    <p>Transaction history of {name}</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UserTransactionHistory
'use client'

import { useState } from "react";
import { usePathname } from 'next/navigation';
import { Crown, RefreshCw } from "lucide-react";
import { actionPanel } from "@/constants";
import TransactionActionPanel from "@/components/TransactionActionPanel";

const STATUS_MAP: Record<string, string> = {
  "Defaulted": "DEFAULTED",
  "Grace Period": "GRACE_PERIOD",
  "Active": "ACTIVE",
  "Paid": "PAID",
};

const Transactions = () => {

  const pathname = usePathname();
  const label =
    pathname === "/admin"
      ? "Dashboard"
      : pathname
        .replace("/admin", "")
        .split("/")
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" / ");

  const [selected, setSelected] = useState(actionPanel[0]?.name ?? "Active");

  const refresh = () => {
    window.location.reload();
  };

  return (
    <div className='mt-4'>
      <p className='tracking-wide uppercase font-bold mb-1'>{label}</p>
      <div className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border w-fit bg-amber-50 text-amber-700 border-amber-200 mb-6">
        <Crown className="w-3 h-3" />
        Manage {label}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-6 p-3 pt-3 bg-zinc-50 h-full rounded">
          <div className="flex flex-col md:flex-row gap-6">
            {actionPanel.map((item) => (
              <div
                key={item.name}
                onClick={() => setSelected(item.name)}
                className={`capitalize cursor-pointer px-2 py-1 rounded flex gap-2 items-center text-xs ${selected === item.name ? ' bg-black text-white px-6 font-semibold' : 'text-gray-600'
                  }`}
              >
                {item.name}
              </div>
            ))}
          </div>
          <button className="flex gap-1 items-center text-gray-600 mr-4 cursor-pointer"
            onClick={refresh}>
            <RefreshCw className="w-3" />
            <p className="text-[11px]">Refresh</p>
          </button>
        </div>

        <div className="">
          <div className="">
            <TransactionActionPanel status={STATUS_MAP[selected]} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Transactions;
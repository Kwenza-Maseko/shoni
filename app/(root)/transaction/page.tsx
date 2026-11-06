'use client'

import { useState } from "react";
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
  const [selected, setSelected] = useState(actionPanel[0]?.name ?? "Active");

  const refresh = () => {
    window.location.reload();
  };

  return (
    <div className=''>
      <div className="space-y-6 mt-25">
        <div className="flex flex-col md:flex-row justify-between gap-6 p-3 pt-3 bg-gray-800 h-full rounded">
          <div className="flex flex-col md:flex-row gap-6">
            {actionPanel.map((item) => (
              <div
                key={item.name}
                onClick={() => setSelected(item.name)}
                className={`capitalize cursor-pointer px-2 py-1 rounded flex gap-2 items-center text-xs ${selected === item.name ? ' bg-slate-200 text-slate-900 px-6 font-semibold' : 'text-slate-100'
                  }`}
              >
                {item.name}
              </div>
            ))}
          </div>
          <button className="flex gap-1 items-center text-slate-100 mr-4 cursor-pointer"
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
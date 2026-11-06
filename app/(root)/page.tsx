"use client";

import { useEffect, useMemo } from "react";
import { Wallet, AlertTriangle, Clock, CheckCircle2, LucideIcon, Crown } from "lucide-react";
import { useTransactionStore } from "@/lib/store/useTransactionStore";
import { usePathname } from "next/navigation";
import { Profit } from "@/components/Profit";
import { LoanVsReturn } from "@/components/LoanVsReturns";
import { computeTotalProfit, computeMonthlyLoanVsProfit } from "@/lib/loan-stat";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const formatCurrency = (amount: number) => {
  return `R${amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  tone?: "default" | "danger" | "warning" | "success";
}

const TONE_STYLES: Record<NonNullable<StatCardProps["tone"]>, { bg: string; icon: string; subtitle: string }> = {
  default: { bg: "bg-zinc-300", icon: "text-zinc-700", subtitle: "text-zinc-300" },
  danger: { bg: "bg-red-300", icon: "text-red-900", subtitle: "text-red-300" },
  warning: { bg: "bg-amber-300", icon: "text-amber-900", subtitle: "text-amber-300" },
  success: { bg: "bg-emerald-300", icon: "text-emerald-900", subtitle: "text-emerald-300" },
};

export const StatCard = ({ label, value, subtext, icon: Icon, tone = "default" }: StatCardProps) => {
  const styles = TONE_STYLES[tone];

  return (
    <div className="flex-1 min-w-50 rounded-lg border border-gray-800 p-4 bg-gray-700">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-light  tracking-wide text-slate-300">
          {label}
        </p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.bg}`}>
          <Icon className={`w-4 h-4 ${styles.icon}`} />
        </div>
      </div>
      <p className="text-3xl text-white font-bold">{value}</p>
      {subtext && <p className={`text-xs mt-1 font-regular ${styles.subtitle}`}>{subtext}</p>}
    </div>
  );
};

const StatCardsOverview = () => {
  const { transactions, loading, fetchTransactions, runAutoStatusUpdates } = useTransactionStore();

  useEffect(() => {
    fetchTransactions().then(() => {
      runAutoStatusUpdates();
    });
  }, [fetchTransactions, runAutoStatusUpdates]);

  const stats = useMemo(() => {
    let totalAmountOwed = 0;
    let defaultedAmount = 0;
    let gracePeriodAmount = 0;
    let gracePeriodCount = 0;
    let totalCollected = 0;

    for (const t of transactions) {
      const owed = parseFloat(t.cachedAmountOwed) || 0;

      if (t.loanStatus === "PAID") {
        totalCollected += owed;
        continue;
      }

      totalAmountOwed += owed;

      if (t.loanStatus === "DEFAULTED") {
        defaultedAmount += owed;
      }

      if (t.loanStatus === "GRACE_PERIOD") {
        gracePeriodAmount += owed;
        gracePeriodCount += 1;
      }
    }

    return {
      totalAmountOwed,
      defaultedAmount,
      gracePeriodAmount,
      gracePeriodCount,
      totalCollected,
    };
  }, [transactions]);

  const totalProfit = useMemo(() => computeTotalProfit(transactions), [transactions]);
  const monthlyData = useMemo(() => computeMonthlyLoanVsProfit(transactions, 6), [transactions]);

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex gap-4 flex-wrap mt-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 min-w-50 h-24 rounded-lg border border-zinc-200 bg-zinc-50 animate-pulse"
            />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="w-full h-80 rounded-xl border border-zinc-200 bg-zinc-50 animate-pulse" />
          <div className="w-full h-80 rounded-xl border border-zinc-200 bg-zinc-50 animate-pulse" />
        </div>
      </div>

    );
  }

  return (
    <div>
      <div className="mt-25 flex gap-4 flex-wrap">
        <StatCard
          label="Total Amount Owed"
          value={formatCurrency(stats.totalAmountOwed)}
          subtext="Across all active, grace period & defaulted loans"
          icon={Wallet}
          tone="default"
        />
        <StatCard
          label="Defaulted Amount"
          value={formatCurrency(stats.defaultedAmount)}
          subtext="At-risk capital"
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard
          label="In Grace Period"
          value={formatCurrency(stats.gracePeriodAmount)}
          subtext={`${stats.gracePeriodCount} loan${stats.gracePeriodCount === 1 ? "" : "s"} awaiting payment`}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Total Collected"
          value={formatCurrency(stats.totalCollected)}
          subtext="Fully repaid loans"
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-8">
        <div>
          <Profit totalProfit={totalProfit} monthlyData={monthlyData} />
        </div>
        <div>
          <LoanVsReturn data={monthlyData} />
        </div>
      </div>
    </div>
  );
};

export default StatCardsOverview;

import { Transcations } from "@/lib/loan-auto-status";

export function computeTotalProfit(transactions: Transcations[]): number {
    return transactions.reduce((sum, t) => {
        if (t.loanStatus !== "PAID") return sum;
 
        const principal = parseFloat(t.principle) || 0;
        const collected = parseFloat(t.cachedAmountOwed) || 0;
 
        return sum + (collected - principal);
    }, 0);
}

export interface MonthOption {
    key: string;  
    label: string; 
}
export interface MonthlyLoanStat {
    month: string;
    loaned: number;
    profit: number;
}

export const totalLoaned = (loans: Transcations[]): number =>
    loans.reduce((sum, l) => sum + (parseFloat(l.principle) || 0), 0);
 
export const totalExpectedReturn = (loans: Transcations[]): number =>
    loans.reduce((sum, l) => sum + (parseFloat(l.cachedAmountOwed) || 0), 0);
 
export interface MonthOption {
    key: string;   // "2026-6" — stable identifier to match against
    label: string; // "July 2026" — what you'd show on a tab
}
 

export function getLoansInMonth(
    transactions: Transcations[],
    monthDate: Date = new Date()
): Transcations[] {
    const targetKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;

    return transactions.filter((t) => {
        const taken = new Date(t.takenAt);
        return `${taken.getFullYear()}-${taken.getMonth()}` === targetKey;
    });
}

export function getLoansByMonthKey(
    transactions: Transcations[],
    monthKey: string
): Transcations[] {
    return transactions.filter((t) => {
        const taken = new Date(t.takenAt);
        return `${taken.getFullYear()}-${taken.getMonth()}` === monthKey;
    });
}

export function getRecentMonthOptions(monthsBack = 6): MonthOption[] {
    const now = new Date();
    const options: MonthOption[] = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        options.push({
            key: `${d.getFullYear()}-${d.getMonth()}`,
            label: d.toLocaleDateString("en-ZA", { month: "long", year: "numeric" }),
        });
    }

    return options;
}

export function computeMonthlyLoanVsProfit(
    transactions: Transcations[],
    monthsBack = 6
): MonthlyLoanStat[] {
    const now = new Date();
 
    const months: (MonthlyLoanStat & { key: string })[] = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            key: `${d.getFullYear()}-${d.getMonth()}`,
            month: d.toLocaleDateString("en-ZA", { month: "long" }),
            loaned: 0,
            profit: 0,
        });
    }
 
    const indexByKey = new Map(months.map((m, idx) => [m.key, idx]));
    const keyOf = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
 
    for (const t of transactions) {
        const principal = parseFloat(t.principle) || 0;
        const cachedOwed = parseFloat(t.cachedAmountOwed) || 0;
 
        const takenKey = keyOf(new Date(t.takenAt));
        const takenIdx = indexByKey.get(takenKey);
        if (takenIdx === undefined) continue;
 
        months[takenIdx].loaned += principal;
        months[takenIdx].profit += cachedOwed - principal;
    }
 
    return months.map(({ month, loaned, profit }) => ({ month, loaned, profit }));
}



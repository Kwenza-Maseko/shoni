
export interface Transcations {
    id: string;
    loanerId: string;
    loaneeId: string;
    principle: string;
    loaneeName: string;
    loaneePhoneNumber: string;
    baseInterestRate: string;
    interestStage: string;
    cachedAmountOwed: string;
    bankName: string,
    loanStatus: string;
    takenAt: string;
    dueDate: string;
    gracePeriod: string | null;
    paidAt: string | null;
    createAt: string;
    updatedAt: string;
}

export interface AutoStatusUpdate {
    loanStatus: "ACTIVE" | "GRACE_PERIOD" | "DEFAULTED";
    interestStage: number;
    cachedAmountOwed: string;
    gracePeriod: string | null;
}

const daysSince = (dateStr: string): number => {
    const taken = new Date(dateStr);
    const today = new Date();

    const takenUTC = Date.UTC(taken.getFullYear(), taken.getMonth(), taken.getDate());
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

    return Math.floor((todayUTC - takenUTC) / (1000 * 60 * 60 * 24));
};

const TERM_DAYS = 30;
const GRACE_DAYS = 3;
const DEFAULT_STARTS_AT = TERM_DAYS + GRACE_DAYS + 1;

export function computeAutoLoanUpdate(trans: Transcations): AutoStatusUpdate | null {
    if (trans.loanStatus === "PAID") return null;

    const daysElapsed = daysSince(trans.takenAt);
    const principal = parseFloat(trans.principle);
    const baseRate = parseFloat(trans.baseInterestRate);

    if (Number.isNaN(principal) || Number.isNaN(baseRate)) return null;

    if (daysElapsed <= TERM_DAYS) {
        if (trans.loanStatus === "ACTIVE") return null;

        return {
            loanStatus: "ACTIVE",
            interestStage: 1,
            cachedAmountOwed: (principal * (1 + baseRate / 100)).toFixed(2),
            gracePeriod: null,
        };
    }
    if (daysElapsed < DEFAULT_STARTS_AT) {
        if (trans.loanStatus === "GRACE_PERIOD") return null;

        const takenDate = new Date(trans.takenAt);
        const graceEndsAt = new Date(takenDate);
        graceEndsAt.setDate(graceEndsAt.getDate() + TERM_DAYS + GRACE_DAYS);

        return {
            loanStatus: "GRACE_PERIOD",
            interestStage: Number(trans.interestStage),
            cachedAmountOwed: trans.cachedAmountOwed,
            gracePeriod: graceEndsAt.toISOString(),
        };
    }

    const stage = 2 + Math.floor((daysElapsed - DEFAULT_STARTS_AT) / 30);
    const cachedAmountOwed = (principal * (1 + (baseRate / 100) * stage)).toFixed(2);

    const unchanged =
        trans.loanStatus === "DEFAULTED" &&
        Number(trans.interestStage) === stage &&
        trans.cachedAmountOwed === cachedAmountOwed;

    if (unchanged) return null;

    return {
        loanStatus: "DEFAULTED",
        interestStage: stage,
        cachedAmountOwed,
        gracePeriod: trans.gracePeriod ?? null,
    };
}
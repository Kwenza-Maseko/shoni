
import { relations } from "drizzle-orm/_relations";
import {
    pgTable,
    varchar,
    text,
    timestamp,
    uuid,
    pgEnum,
    numeric,
    integer,
    unique,
} from "drizzle-orm/pg-core";


export const userRoleEnum = pgEnum("user_role", ["LOANEE", "LOANER"]);
export const protectedEnum = pgEnum("protected_status", ["YES", "NO"]);
export const pageOpenedEnum = pgEnum("page_opened", ["YES", "NO"]); 

export const loanStatusEnum = pgEnum("loan_status", [
    "ACTIVE",
    "GRACE_PERIOD",
    "DEFAULTED",
    "PAID",
]);

export const users = pgTable("users", {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 100 }).notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    phoneNumber: varchar("phone_number", { length: 13 }).notNull(),
    role: userRoleEnum("role").default("LOANEE").notNull(),
    lastLogin: timestamp("last_login", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    passwordResetToken: varchar("password_reset_token", { length: 255 }),
    passwordResetExpires: timestamp("password_reset_expires", {
        withTimezone: true,
    }),
});

export const loans = pgTable("loans", {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    loanerId: uuid("loaner_id")
        .notNull()
        .references(() => users.id),
    loaneeId: uuid("loanee_id")
        .notNull()
        .references(() => users.id),
    principal: numeric("principal", { precision: 12, scale: 2 }).notNull(),
    baseInterestRate: numeric("base_interest_rate", {
        precision: 5,
        scale: 2,
    })
        .notNull()
        .default("40.00"),
    interestStage: integer("interest_stage").notNull().default(1),
    cachedAmountOwed: numeric("cached_amount_owed", {
        precision: 12,
        scale: 2,
    }).notNull(),
    LoanStatus: loanStatusEnum("loan_status").notNull().default("ACTIVE"),
    takenAt: timestamp("taken_at", { withTimezone: true }).notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),

    graceEndsAt: timestamp("grace_ends_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const payments = pgTable("payments", {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    loanId: uuid("loan_id")
        .notNull()
        .references(() => loans.id),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    note: text("note"),
});

export const loanStageHistory = pgTable("loan_stage_history", {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    loanId: uuid("loan_id")
        .notNull()
        .references(() => loans.id),
    fromStage: integer("from_stage").notNull(),
    toStage: integer("to_stage").notNull(),
    amountOwedAtChange: numeric("amount_owed_at_change", {
        precision: 12,
        scale: 2,
    }).notNull(),
    changedAt: timestamp("changed_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    reason: text("reason").default("grace_period_expired"),
});


 
export const settings = pgTable(
    "settings",
    {
        id: uuid("id").notNull().primaryKey().defaultRandom(),
        loanerId: uuid("loaner_id")
            .notNull()
            .references(() => users.id),
        page: varchar("page", { length: 100 }).notNull(),
        protected: protectedEnum("protected").notNull().default("YES"),
        protectionPass: varchar("protection_pass", { length: 255 }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        loanerPageUnique: unique("settings_loaner_page_unique").on(
            table.loanerId,
            table.page
        ),
    })
);

// ---------------------------------------------------------------------------
// RELATIONS
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
    loansGiven: many(loans, { relationName: "loaner" }),
    loansTaken: many(loans, { relationName: "loanee" }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
    loaner: one(users, {
        fields: [loans.loanerId],
        references: [users.id],
        relationName: "loaner",
    }),
    loanee: one(users, {
        fields: [loans.loaneeId],
        references: [users.id],
        relationName: "loanee",
    }),
    payments: many(payments),
    stageHistory: many(loanStageHistory),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    loan: one(loans, {
        fields: [payments.loanId],
        references: [loans.id],
    }),
}));

export const loanStageHistoryRelations = relations(
    loanStageHistory,
    ({ one }) => ({
        loan: one(loans, {
            fields: [loanStageHistory.loanId],
            references: [loans.id],
        }),
    })
);
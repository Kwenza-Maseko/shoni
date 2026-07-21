CREATE TYPE "loan_status" AS ENUM('ACTIVE', 'GRACE_PERIOD', 'DEFAULTED', 'PAID');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('LOANEE', 'LOANER');--> statement-breakpoint
CREATE TABLE "loan_stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"loan_id" uuid NOT NULL,
	"from_stage" integer NOT NULL,
	"to_stage" integer NOT NULL,
	"amount_owed_at_change" numeric(12,2) NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reason" text DEFAULT 'grace_period_expired'
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"loaner_id" uuid NOT NULL,
	"loanee_id" uuid NOT NULL,
	"principal" numeric(12,2) NOT NULL,
	"base_interest_rate" numeric(5,2) DEFAULT '40.00' NOT NULL,
	"interest_stage" integer DEFAULT 1 NOT NULL,
	"cached_amount_owed" numeric(12,2) NOT NULL,
	"status" "loan_status" DEFAULT 'ACTIVE'::"loan_status" NOT NULL,
	"taken_at" timestamp with time zone NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"grace_ends_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"loan_id" uuid NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"full_name" varchar(100) NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"phone_number" varchar(13) NOT NULL,
	"role" "user_role" DEFAULT 'LOANEE'::"user_role" NOT NULL,
	"last_login" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"password_reset_token" varchar(255),
	"password_reset_expires" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "loan_stage_history" ADD CONSTRAINT "loan_stage_history_loan_id_loans_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id");--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_loaner_id_users_id_fkey" FOREIGN KEY ("loaner_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_loanee_id_users_id_fkey" FOREIGN KEY ("loanee_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_loan_id_loans_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id");
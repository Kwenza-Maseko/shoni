CREATE TYPE "notification_type" AS ENUM('UPCOMING', 'GRACE_PERIOD', 'DEFAULTED');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"loan_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"is_read" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_loan_type_unique" UNIQUE("loan_id","type")
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_loan_id_loans_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE;
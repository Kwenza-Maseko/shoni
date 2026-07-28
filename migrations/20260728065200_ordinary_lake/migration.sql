CREATE TABLE "shoni_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"loaner_id" uuid NOT NULL,
	"amount" numeric(12,2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shoni_account" ADD CONSTRAINT "shoni_account_loaner_id_users_id_fkey" FOREIGN KEY ("loaner_id") REFERENCES "users"("id");
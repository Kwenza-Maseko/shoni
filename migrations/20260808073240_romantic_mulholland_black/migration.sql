CREATE TABLE "bank" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"bankName" varchar(50) NOT NULL,
	"charges" numeric(12,2) NOT NULL,
	"create_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bankId" uuid;
ALTER TABLE "users"
ADD CONSTRAINT "users_bankId_bank_id_fkey"
FOREIGN KEY ("bankId")
REFERENCES "bank"("id");
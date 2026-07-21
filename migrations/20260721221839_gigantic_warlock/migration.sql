CREATE TYPE "page_opened" AS ENUM('YES', 'NO');--> statement-breakpoint
CREATE TYPE "protected_status" AS ENUM('YES', 'NO');--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"loaner_id" uuid NOT NULL,
	"page" varchar(100) NOT NULL,
	"protected" "protected_status" DEFAULT 'YES'::"protected_status" NOT NULL,
	"protection_pass" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_loaner_page_unique" UNIQUE("loaner_id","page")
);
--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_loaner_id_users_id_fkey" FOREIGN KEY ("loaner_id") REFERENCES "users"("id");
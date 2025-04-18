CREATE TABLE "brand" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"logo" varchar(255) NOT NULL,
	"title" varchar(50) NOT NULL,
	"description" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_blacklisted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "brand" ADD CONSTRAINT "brand_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
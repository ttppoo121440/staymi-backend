CREATE TYPE "public"."plan" AS ENUM('free', 'plus', 'pro');--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"status" varchar(20) NOT NULL,
	"started_at" timestamp NOT NULL,
	"end_at" timestamp NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"cancelled_at" timestamp,
	"paytime" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
CREATE TYPE "public"."gender" AS ENUM('f', 'm');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('consumer', 'store', 'admin');--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"birthday" timestamp,
	"gender" "gender" DEFAULT 'm' NOT NULL,
	"avatar" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password" varchar(72) NOT NULL,
	"provider" varchar(20),
	"provider_id" varchar(50),
	"role" "role" DEFAULT 'consumer' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
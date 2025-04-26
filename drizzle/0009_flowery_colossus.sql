ALTER TABLE "user_profile" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ALTER COLUMN "gender" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;
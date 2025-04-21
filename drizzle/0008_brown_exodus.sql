CREATE TYPE "public"."user_brand_role" AS ENUM('owner', 'manager', 'staff');--> statement-breakpoint
ALTER TABLE "user_brand" ALTER COLUMN "role" SET DATA TYPE user_brand_role;
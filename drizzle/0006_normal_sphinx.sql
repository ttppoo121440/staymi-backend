CREATE TABLE "hotels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"region" varchar(50) NOT NULL,
	"name" varchar(50) NOT NULL,
	"address" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"transportation" varchar(255) NOT NULL,
	"hotel_policies" varchar(255) NOT NULL,
	"latitude" numeric(10, 6) NOT NULL,
	"longitude" numeric(10, 6) NOT NULL,
	"hotel_facilities" varchar(50)[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_brand_id_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brand"("id") ON DELETE no action ON UPDATE no action;
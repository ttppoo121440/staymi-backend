CREATE TABLE "room_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hotel_id" uuid NOT NULL,
	"hotel_room_id" uuid NOT NULL,
	"price" integer NOT NULL,
	"subscription_price" integer NOT NULL,
	"images" varchar[] DEFAULT '{}',
	"start_time" date NOT NULL,
	"end_time" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "hotel_rooms" RENAME COLUMN "imageUrl" TO "images";--> statement-breakpoint
ALTER TABLE "room_plans" ADD CONSTRAINT "room_plans_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_plans" ADD CONSTRAINT "room_plans_hotel_room_id_room_types_id_fk" FOREIGN KEY ("hotel_room_id") REFERENCES "public"."room_types"("id") ON DELETE no action ON UPDATE no action;
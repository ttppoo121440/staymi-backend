CREATE TYPE "public"."status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TABLE "order_room_product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"hotel_id" uuid NOT NULL,
	"plans_room_id" uuid NOT NULL,
	"check_in_date" timestamp DEFAULT now(),
	"check_out_date" timestamp DEFAULT now(),
	"total_price" integer NOT NULL,
	"role" "status" DEFAULT 'pending' NOT NULL,
	"payment_name" varchar(50) NOT NULL,
	"payment_phone" varchar(20) NOT NULL,
	"payment_email" varchar(320),
	"contact_name" varchar(50) NOT NULL,
	"contact_phone" varchar(20) NOT NULL,
	"contact_email" varchar(320),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "order_room_product_payment_email_unique" UNIQUE("payment_email"),
	CONSTRAINT "order_room_product_contact_email_unique" UNIQUE("contact_email")
);
--> statement-breakpoint
ALTER TABLE "order_room_product" ADD CONSTRAINT "order_room_product_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_room_product" ADD CONSTRAINT "order_room_product_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_room_product" ADD CONSTRAINT "order_room_product_plans_room_id_room_plans_id_fk" FOREIGN KEY ("plans_room_id") REFERENCES "public"."room_plans"("id") ON DELETE no action ON UPDATE no action;
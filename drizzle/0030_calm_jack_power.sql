CREATE TYPE "public"."order_type" AS ENUM('room', 'subscription');--> statement-breakpoint
CREATE TABLE "payment_order_room_product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"order_type" "order_type" NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"method" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"gateway_transaction_id" varchar(255) NOT NULL,
	"fee" integer DEFAULT 0,
	"net_income" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payment_order_room_product" ADD CONSTRAINT "payment_order_room_product_transaction_id_payment_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."payment_transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_order_room_product" ADD CONSTRAINT "payment_order_room_product_order_id_order_room_product_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order_room_product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
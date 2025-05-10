CREATE TABLE "order_room_product_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_plans_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "order_room_product_item" ADD CONSTRAINT "order_room_product_item_order_id_order_room_product_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order_room_product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_room_product_item" ADD CONSTRAINT "order_room_product_item_product_plans_id_product_plans_id_fk" FOREIGN KEY ("product_plans_id") REFERENCES "public"."product_plans"("id") ON DELETE no action ON UPDATE no action;
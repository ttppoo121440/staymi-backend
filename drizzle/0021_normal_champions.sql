ALTER TABLE "order_room_product" RENAME COLUMN "plans_room_id" TO "room_plans_id";--> statement-breakpoint
ALTER TABLE "order_room_product" RENAME COLUMN "role" TO "status";--> statement-breakpoint
ALTER TABLE "order_room_product" DROP CONSTRAINT "order_room_product_plans_room_id_room_plans_id_fk";
--> statement-breakpoint
ALTER TABLE "order_room_product" ADD CONSTRAINT "order_room_product_room_plans_id_room_plans_id_fk" FOREIGN KEY ("room_plans_id") REFERENCES "public"."room_plans"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "room_plans" DROP CONSTRAINT "room_plans_hotel_room_id_room_types_id_fk";
--> statement-breakpoint
ALTER TABLE "room_plans" ADD CONSTRAINT "room_plans_hotel_room_id_hotel_rooms_id_fk" FOREIGN KEY ("hotel_room_id") REFERENCES "public"."hotel_rooms"("id") ON DELETE no action ON UPDATE no action;
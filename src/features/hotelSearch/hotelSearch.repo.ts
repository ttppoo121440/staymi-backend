import { eq, ilike, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { brand } from '@/database/schemas/brand.schema';
import { hotel_rooms } from '@/database/schemas/hotel_rooms.schema';
import { hotels } from '@/database/schemas/hotels.schema';
import { room_plans } from '@/database/schemas/room_plans.schema';
import { room_types } from '@/database/schemas/room_types.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { HttpStatus } from '@/types/http-status.enum';
import { PaginationType } from '@/types/pagination';
import { RepoError } from '@/utils/appError';

import { hotelType } from '../storeHotel/storeHotel.schema';

import { RoomPlanSearchResult } from './hotelSearch.schema';
export class HotelSearchRepo extends BaseRepository {
  async getHotelInputSuggestion(hotelName: string): Promise<{ hotels: hotelType[] }> {
    const result = await db
      .select()
      .from(hotels)
      .where(ilike(hotels.name, `%${hotelName}%`))
      .limit(5);
    if (result.length === 0) {
      throw new RepoError('查無相關飯店', HttpStatus.NOT_FOUND);
    }
    return {
      hotels: result,
    };
  }
  async getAllHotelsPlan(
    currentPage = 1,
    perPage = 10,
  ): Promise<{ roomPlansData: RoomPlanSearchResult[] | null; pagination: PaginationType }> {
    const offset = (currentPage - 1) * perPage;
    const data: RoomPlanSearchResult[] = await db
      .select({
        hotel_id: hotels.id,
        hotel_name: hotels.name,
        hotel_region: hotels.region,
        hotel_address: hotels.address,
        hotel_phone: hotels.phone,
        hotel_facilities: hotels.hotel_facilities,
        hotel_policies: hotels.hotel_policies,
        hotel_cover_image: hotels.image_url,
        transportation: hotels.transportation,
        latitude: hotels.latitude,
        longitude: hotels.longitude,

        room_plan_id: room_plans.id,
        subscription_price: room_plans.subscription_price,
        price: room_plans.price,
        start_date: room_plans.start_date,
        end_date: room_plans.end_date,
        images: room_plans.images,

        hotel_room_id: hotel_rooms.id,
        hotel_room_description: hotel_rooms.description,
        hotel_room_images: hotel_rooms.images,
        hotel_basePrice: hotel_rooms.basePrice,

        room_type_id: room_types.id,
        room_type_name: room_types.name,
        room_type_description: room_types.description,
        room_service: room_types.room_service,

        brand_description: brand.description,
      })
      .from(room_plans)
      .innerJoin(hotels, eq(hotels.id, room_plans.hotel_id))
      .innerJoin(hotel_rooms, eq(room_plans.hotel_room_id, hotel_rooms.id))
      .innerJoin(room_types, eq(hotel_rooms.room_type_id, room_types.id))
      .innerJoin(brand, eq(hotels.brand_id, brand.id))
      .limit(perPage)
      .offset(offset)
      .execute();

    const totalItemsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(room_plans)
      .innerJoin(hotels, eq(hotels.id, room_plans.hotel_id))
      .innerJoin(hotel_rooms, eq(room_plans.hotel_room_id, hotel_rooms.id))
      .innerJoin(room_types, eq(hotel_rooms.room_type_id, room_types.id));

    const totalItems = Number(totalItemsResult[0]?.count ?? 0);
    const totalPages = Math.ceil(totalItems / perPage);

    return {
      roomPlansData: data,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        perPage,
      },
    };
  }
}

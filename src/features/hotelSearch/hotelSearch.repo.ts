import { eq, ilike, sql, and, gte, lte, asc, desc } from 'drizzle-orm';

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
export type HotelSearchParams = {
  currentPage?: number;
  perPage?: number;
  hotel_id?: string;
  hotel_name?: string;
  hotel_region?: string;
  start_date?: string;
  end_date?: string;
  room_type_name?: string;
  min_price?: string;
  max_price?: string;
  hotel_facilities?: string | string[];
  room_service?: string | string[];
  sort_by?: 'price' | 'name' | 'date' | null;
  sort_order?: 'asc' | 'desc' | null;
};

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
    params: HotelSearchParams,
  ): Promise<{ roomPlansData: RoomPlanSearchResult[] | null; pagination: PaginationType }> {
    const {
      currentPage = 1,
      perPage = 10,
      hotel_id,
      hotel_name,
      hotel_region,
      start_date,
      end_date,
      room_type_name,
      min_price,
      max_price,
      hotel_facilities,
      room_service,
      sort_by,
      sort_order,
    } = params;
    const offset = (currentPage - 1) * perPage;

    const conditions = [];
    if (hotel_id) conditions.push(eq(hotels.id, hotel_id));
    if (hotel_name) conditions.push(ilike(hotels.name, `%${hotel_name}%`));
    if (hotel_region) conditions.push(ilike(hotels.region, hotel_region));
    if (start_date && end_date)
      conditions.push(and(gte(room_plans.end_date, start_date), lte(room_plans.start_date, end_date)));
    if (room_type_name) conditions.push(eq(room_types.name, room_type_name));
    if (min_price) conditions.push(gte(room_plans.price, Number(min_price)));
    if (max_price) conditions.push(lte(room_plans.price, Number(max_price)));
    if (hotel_facilities) {
      const facilities = Array.isArray(hotel_facilities) ? hotel_facilities : [hotel_facilities];
      if (facilities.length > 0) {
        const arrayQuery = sql`ARRAY[${sql.join(
          facilities.map((f) => sql`${f}`),
          sql`, `,
        )}]::varchar[]`;
        conditions.push(sql`${hotels.hotel_facilities} && ${arrayQuery}`);
      }
    }
    if (room_service) {
      const services = Array.isArray(room_service) ? room_service : [room_service];
      if (services.length > 0) {
        const arrayQuery = sql`ARRAY[${sql.join(
          services.map((s) => `${s}`),
          sql`, `,
        )}]::varchar[]`;
        conditions.push(sql`${room_types.room_service} && ${arrayQuery}`);
      }
    }

    const sortColumnMap = {
      price: room_plans.price,
      name: hotels.name,
      date: room_plans.start_date,
    } as const;

    const sortColumn = sort_by ? sortColumnMap[sort_by] : room_plans.id;

    const orderClause = sort_order === 'desc' ? desc(sortColumn) : asc(sortColumn);

    const whereClauser = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
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
        start_time: room_plans.start_date,
        end_time: room_plans.end_date,
        plan_images: room_plans.images,

        hotel_room_id: hotel_rooms.id,
        hotel_room_description: hotel_rooms.description,
        hotel_room_images: hotel_rooms.images,
        base_price: hotel_rooms.basePrice,

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
      .where(whereClauser)
      .orderBy(orderClause)
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

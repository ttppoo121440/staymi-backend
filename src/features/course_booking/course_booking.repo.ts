import { eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { course_booking } from '@/database/schemas/course_booking.schema';

import type { Course_bookingCreateType } from './course_booking.schema';
import { Course_bookingCreate, Course_bookingResponseSchema } from './course_booking.schema';

export class Course_bookingRepo {
  async getAll(): Promise<ReturnType<typeof Course_bookingResponseSchema.parse>[]> {
    const result = await db.select().from(course_booking);
    return result.map((pkg) => Course_bookingResponseSchema.parse(pkg));
  }
  async create(data: Course_bookingCreateType): Promise<ReturnType<typeof Course_bookingCreate.parse>> {
    const parsedData = Course_bookingCreate.parse(data);

    const preparedData = {
      ...parsedData,
      booking_at: parsedData.booking_at ? new Date(parsedData.booking_at) : null,
      join_at: parsedData.join_at ? new Date(parsedData.join_at) : null,
      leave_at: parsedData.leave_at ? new Date(parsedData.leave_at) : null,
      cancelled_at: parsedData.cancelled_at ? new Date(parsedData.cancelled_at) : null,
    };

    const result = await db.insert(course_booking).values(preparedData).returning();

    if (result.length === 0) {
      throw new Error('Failed to insert Course_booking');
    }
    return Course_bookingResponseSchema.parse(result[0]);
  }
  async update(id: number, data: Course_bookingCreateType): Promise<ReturnType<typeof Course_bookingCreate.parse>> {
    const parsedData = Course_bookingCreate.parse(data);
    console.log('id:', id);

    const preparedData = {
      ...parsedData,
      booking_at: parsedData.booking_at ? new Date(parsedData.booking_at) : null,
      join_at: parsedData.join_at ? new Date(parsedData.join_at) : null,
      leave_at: parsedData.leave_at ? new Date(parsedData.leave_at) : null,
      cancelled_at: parsedData.cancelled_at ? new Date(parsedData.cancelled_at) : null,
    };

    const result = await db.update(course_booking).set(preparedData).where(eq(course_booking.id, id)).returning();

    console.log('更新結果:', result); // 確保返回的結果正確

    if (result.length === 0) {
      throw new Error(`找不到 ID 為 ${id} 的課程`);
    }

    return Course_bookingResponseSchema.parse(result[0]);
  }
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(course_booking).where(eq(course_booking.id, id));

    console.log(`成功刪除 ID 為 ${id} 的課程`);
    return !!result;
  }
}

import { eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { course } from '@/database/schemas/course.schema';

import type { CourseCreateType } from './course.schema';
import { CourseResponseSchema, CourseCreate } from './course.schema';

export class CourseRepo {
  async getAll(): Promise<ReturnType<typeof CourseResponseSchema.parse>[]> {
    const result = await db.select().from(course);
    return result.map((pkg) => CourseResponseSchema.parse(pkg));
  }
  async adminGetAll(): Promise<ReturnType<typeof CourseResponseSchema.parse>[]> {
    const result = await db.select().from(course);
    return result.map((pkg) => CourseResponseSchema.parse(pkg));
  }
  async adminCreate(data: CourseCreateType): Promise<ReturnType<typeof CourseCreate.parse>> {
    const parsedData = CourseCreate.parse(data);

    const preparedData = {
      ...parsedData,
      start_at: new Date(parsedData.start_at),
      end_at: new Date(parsedData.end_at),
    };

    const result = await db.insert(course).values(preparedData).returning();

    if (result.length === 0) {
      throw new Error('Failed to insert course');
    }
    return CourseResponseSchema.parse(result[0]);
  }
  async adminUpdate(id: number, data: CourseCreateType): Promise<ReturnType<typeof CourseCreate.parse>> {
    const parsedData = CourseCreate.parse(data);
    console.log('id:', id);

    const preparedData = {
      ...parsedData,
      start_at: new Date(parsedData.start_at),
      end_at: new Date(parsedData.end_at),
    };

    const result = await db.update(course).set(preparedData).where(eq(course.id, id)).returning();

    console.log('更新結果:', result); // 確保返回的結果正確

    if (result.length === 0) {
      throw new Error(`找不到 ID 為 ${id} 的課程`);
    }

    return CourseResponseSchema.parse(result[0]);
  }
}

import dayjs from 'dayjs';
import { z } from 'zod';

// ✅ 將輸入轉成 Date，提供給 Zod 使用
export const parseDate = (value: unknown): Date | undefined => {
  if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.toDate() : undefined;
  }
  return undefined;
};

// ✅ 提供給 Zod schema 使用（只驗證 Date，不做字串格式）
export const parseZodDate = (): z.ZodEffects<z.ZodTypeAny, Date, unknown> =>
  z.preprocess((val) => parseDate(val), z.date({ message: '日期格式錯誤' }));

// ✅ 提供格式化後的顯示（前端用）
export const formatDisplayDate = (
  value: Date | string | null | undefined,
  format = 'YYYY-MM-DD',
): string | undefined => {
  if (!value) return undefined;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(format) : undefined;
};

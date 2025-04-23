import dayjs from 'dayjs';
import { z, ZodType } from 'zod';

// 提供格式化後的顯示（前端用）
export const formatDisplayDate = (
  value: Date | string | null | undefined,
  format = 'YYYY-MM-DD',
): string | undefined => {
  if (!value) return undefined;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(format) : undefined;
};
// 包裝成函式，提供預設值的日期 Schema
export const zDateOrDefault = (defaultDate: Date = new Date(0)): ZodType<Date | null> =>
  z
    .preprocess((val) => {
      if (val === undefined || val === null) return defaultDate;

      // 接收字串、數字並使用 dayjs 處理
      if (typeof val === 'string' || typeof val === 'number') {
        const parsed = dayjs(val);
        return parsed.isValid() ? parsed.toDate() : defaultDate;
      }

      return val;
    }, z.date({ message: '日期格式錯誤' }))
    .nullable() as ZodType<Date | null>;

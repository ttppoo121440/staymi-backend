import dayjs from 'dayjs';

export const formatDate = (value: unknown): string | undefined => {
  if (value instanceof Date) {
    return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
  }
  return undefined;
};

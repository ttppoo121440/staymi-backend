import { z } from 'zod';

export const paginationSchema = z.object({
  currentPage: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
});

export type PaginationType = z.infer<typeof paginationSchema>;

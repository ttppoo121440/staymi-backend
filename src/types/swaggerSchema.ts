import { z } from 'zod';

export const swaggerResponseSchema = z.object({
  message: z.string(),
  status: z.boolean(),
});

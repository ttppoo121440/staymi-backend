import { z } from 'zod';

import { formatDateStringZod } from '@/utils/formatDate';

export const adminUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string(),
  birthday: formatDateStringZod(),
  gender: z.enum(['f', 'm'], { message: '請選擇性別' }),
  avatar: z.string().nullable().optional(),
  provider: z.string().optional(),
  provider_id: z.string().optional(),
  role: z.enum(['consumer', 'store', 'admin']),
  is_blacklisted: z.boolean(),
  createdAt: formatDateStringZod(),
  updatedAt: formatDateStringZod(),
});
export const adminUserArraySchema = z.array(adminUserSchema);

export const adminUserUpdateRoleSchema = adminUserSchema.pick({
  id: true,
  role: true,
});

export const adminUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: adminUserArraySchema.optional(),
  }),
});

export const adminUserQuerySchema = z.object({
  email: z.string().optional(),
  is_blacklisted: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  currentPage: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).default(10),
});

export type adminUserType = z.infer<typeof adminUserSchema>;
export type adminUserArrayType = z.infer<typeof adminUserArraySchema>;
export type adminUserResponseType = z.infer<typeof adminUserResponseSchema>;
export type adminUserQueryType = z.infer<typeof adminUserQuerySchema>;

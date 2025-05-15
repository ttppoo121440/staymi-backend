import { z } from 'zod';

import { paginationSchema } from '@/types/pagination';
import { formatDisplayDate, zDateOrDefault } from '@/utils/formatDate';

export const adminUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  birthday: zDateOrDefault().nullable().optional(),
  gender: z.enum(['f', 'm'], { message: '請選擇性別' }).nullable().optional(),
  avatar: z.string().nullable().optional(),
  provider: z.string().optional(),
  provider_id: z.string().optional(),
  role: z.enum(['consumer', 'store', 'admin'], { message: '無效的角色值' }),
  is_blacklisted: z.boolean(),
  created_at: zDateOrDefault(),
  updated_at: zDateOrDefault(),
});
export const adminUserArraySchema = z.array(adminUserSchema);

export const adminUserToDTO = z
  .object({
    user: adminUserSchema,
  })
  .transform((data) => ({
    user: {
      ...data.user,
      birthday: formatDisplayDate(data.user.birthday),
      created_at: formatDisplayDate(data.user.created_at),
      updated_at: formatDisplayDate(data.user.updated_at),
    },
  }));

export const adminUserListToDto = z
  .object({
    users: adminUserArraySchema,
    pagination: paginationSchema,
  })
  .transform((data) => ({
    users: data.users.map((user) => ({
      ...user,
      birthday: formatDisplayDate(user.birthday),
      created_at: formatDisplayDate(user.created_at),
      updated_at: formatDisplayDate(user.updated_at),
    })),
    pagination: data.pagination,
  }));

export const adminUserUpdateRoleSchema = adminUserSchema.pick({
  role: true,
  updated_at: true,
});

export const adminUserUpdateRoleToDto = z
  .object({
    user: adminUserUpdateRoleSchema,
  })
  .transform((data) => ({
    user: {
      ...data.user,
      updated_at: formatDisplayDate(data.user.updated_at, 'YYYY-MM-DD HH:mm:ss'),
    },
  }));

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
export type adminUserUpdateRoleType = z.infer<typeof adminUserUpdateRoleSchema> & { id: string };

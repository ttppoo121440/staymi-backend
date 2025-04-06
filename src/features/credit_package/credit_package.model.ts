import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { credit_package } from '@/database/schemas/creditPackage.schema';

// 根據 credit_package 資料表結構生成插入資料的 Zod 模式
export const insertCredit_packageSchema = createInsertSchema(credit_package);
// 根據 credit_package 資料表結構生成選取資料的 Zod 模式
export const selectCredit_packageSchema = createSelectSchema(credit_package);

import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { credit_purchase } from '@/database/schemas/credit_purchase.schema';

export const insertCredit_purchaseSchema = createInsertSchema(credit_purchase);
export const selectCredit_purchaseSchema = createSelectSchema(credit_purchase);

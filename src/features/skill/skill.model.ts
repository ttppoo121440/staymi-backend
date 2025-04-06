import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { skill } from '@/database/schemas/skill.schema';

export const insertSkillSchema = createInsertSchema(skill);
export const selectSkillSchema = createSelectSchema(skill);

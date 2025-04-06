import { db } from '@/config/database';
import { skill } from '@/database/schemas/skill.schema';

import { selectSkillSchema } from './skill.model';

export class SkillRepo {
  async getAll(): Promise<ReturnType<typeof selectSkillSchema.parse>[]> {
    const result = await db.select().from(skill);
    return result.map((skill) => selectSkillSchema.parse(skill));
  }
}

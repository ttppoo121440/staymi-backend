import type { Request, Response } from 'express';

import { successResponse } from '@/utils/appResponse';

import { SkillRepo } from './skill.repo';
import { skillArrayResponseSchema } from './skill.schema';

export class SkillController {
  private SkillRepo = new SkillRepo();

  async getAll(req: Request, res: Response): Promise<void> {
    const skills = await this.SkillRepo.getAll();
    const validatedData = skillArrayResponseSchema.parse(skills);

    res.status(200).json(successResponse(validatedData, '成功獲得技能'));
  }
}

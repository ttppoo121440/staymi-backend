import express from 'express';

import { SkillController } from './skill.controller';

const skillRoutes = express.Router();
const skillController = new SkillController();

skillRoutes.get('/', skillController.getAll.bind(skillController));

export default skillRoutes;

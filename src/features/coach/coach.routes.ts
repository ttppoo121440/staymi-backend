import express from 'express';

import { CoachController } from './coach.controller';

const CoachRoutes = express.Router();
const coachController = new CoachController();

CoachRoutes.get('/', coachController.getAll.bind(coachController));
CoachRoutes.get('/:id', coachController.getById.bind(coachController));
CoachRoutes.post('/:userId', (req, res) => coachController.create(req, res));

export default CoachRoutes;

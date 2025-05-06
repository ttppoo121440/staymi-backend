import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { RoomPlanController } from './roomPlan.controller';

const roomPlanRoutes = express.Router();
const roomPlanController = new RoomPlanController();

roomPlanRoutes.patch(
  '/:id/active',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomPlanController.toggleActive,
);

roomPlanRoutes.put(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomPlanController.update,
);

roomPlanRoutes.get(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomPlanController.getById,
);

roomPlanRoutes.delete(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomPlanController.delete,
);

roomPlanRoutes.get(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomPlanController.getAll,
);

roomPlanRoutes.post(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomPlanController.create,
);

export default roomPlanRoutes;

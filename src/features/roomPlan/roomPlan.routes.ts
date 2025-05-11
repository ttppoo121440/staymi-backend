import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { authHotelId } from '@/middleware/authHotelId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { RoomPlanController } from './roomPlan.controller';

const roomPlanRoutes = express.Router();
const roomPlanController = new RoomPlanController();

roomPlanRoutes.patch(
  '/:id/active',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  roomPlanController.toggleActive,
);

roomPlanRoutes.put(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  roomPlanController.update,
);

roomPlanRoutes.get(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  roomPlanController.getById,
);

roomPlanRoutes.delete(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  roomPlanController.delete,
);

roomPlanRoutes.get(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  roomPlanController.getAll,
);

roomPlanRoutes.post(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  roomPlanController.create,
);

export default roomPlanRoutes;

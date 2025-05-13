import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { authHotelId } from '@/middleware/authHotelId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';
import { uuidParams, zodMiddleware } from '@/middleware/zodMiddleware';

import { RoomPlanController } from './roomPlan.controller';
import { roomPlanCreateSchema, roomPlanUpdateSchema } from './roomPlan.schema';

const roomPlanRoutes = express.Router();
const roomPlanController = new RoomPlanController();

roomPlanRoutes.patch(
  '/:id/active',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  roomPlanController.toggleActive,
);

roomPlanRoutes.put(
  '/:id',
  authMiddleware,
  zodMiddleware({ body: roomPlanUpdateSchema, params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  roomPlanController.update,
);

roomPlanRoutes.get(
  '/:id',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  roomPlanController.getById,
);

roomPlanRoutes.delete(
  '/:id',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
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
  zodMiddleware({ body: roomPlanCreateSchema }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  roomPlanController.create,
);

export default roomPlanRoutes;

import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';
import { uuidParams, zodMiddleware } from '@/middleware/zodMiddleware';

import { RoomTypeController } from './roomType.controller';
import { roomTypesCreateSchema, roomTypesUpdateSchema } from './roomType.schema';

const roomTypeRoutes = express.Router();
const roomTypeController = new RoomTypeController();

roomTypeRoutes.get(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomTypeController.getAll,
);
roomTypeRoutes.get(
  '/:id',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomTypeController.getById,
);

roomTypeRoutes.post(
  '/',
  authMiddleware,
  zodMiddleware({ body: roomTypesCreateSchema }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomTypeController.create,
);
roomTypeRoutes.put(
  '/:id',
  authMiddleware,
  zodMiddleware({ body: roomTypesUpdateSchema, params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomTypeController.update,
);
roomTypeRoutes.delete(
  '/:id',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomTypeController.delete,
);

export default roomTypeRoutes;

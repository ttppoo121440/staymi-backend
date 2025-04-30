import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { RoomTypeController } from './roomType.controller';

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
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomTypeController.getById,
);

roomTypeRoutes.post(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomTypeController.create,
);
roomTypeRoutes.put(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomTypeController.update,
);
roomTypeRoutes.delete(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  roomTypeController.delete,
);

export default roomTypeRoutes;

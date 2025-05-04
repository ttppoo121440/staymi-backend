import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { HotelRoomController } from './hotelRoom.controller';

const hotelRoomRoutes = express.Router();
const hotelRoomController = new HotelRoomController();

hotelRoomRoutes.patch(
  '/:id/active',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  hotelRoomController.updateIsActive,
);

hotelRoomRoutes.put(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  hotelRoomController.update,
);

hotelRoomRoutes.get(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  hotelRoomController.getById,
);

hotelRoomRoutes.delete(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  hotelRoomController.delete,
);

hotelRoomRoutes.get(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  hotelRoomController.getAll,
);

hotelRoomRoutes.post(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  hotelRoomController.create,
);

export default hotelRoomRoutes;

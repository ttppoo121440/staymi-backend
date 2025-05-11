import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { authHotelId } from '@/middleware/authHotelId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { HotelRoomController } from './hotelRoom.controller';

const hotelRoomRoutes = express.Router();
const hotelRoomController = new HotelRoomController();

hotelRoomRoutes.patch(
  '/:id/active',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelRoomController.toggleActive,
);

hotelRoomRoutes.put(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelRoomController.update,
);

hotelRoomRoutes.get(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelRoomController.getById,
);

hotelRoomRoutes.delete(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelRoomController.delete,
);

hotelRoomRoutes.get(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelRoomController.getAll,
);

hotelRoomRoutes.post(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelRoomController.create,
);

export default hotelRoomRoutes;

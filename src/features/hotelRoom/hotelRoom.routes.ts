import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { authHotelId } from '@/middleware/authHotelId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';
import { uuidParams, zodMiddleware } from '@/middleware/zodMiddleware';

import { HotelRoomController } from './hotelRoom.controller';
import { hotelRoomCreateSchema, hotelRoomUpdateSchema } from './hotelRoom.schema';

const hotelRoomRoutes = express.Router();
const hotelRoomController = new HotelRoomController();

hotelRoomRoutes.patch(
  '/:id/active',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelRoomController.toggleActive,
);

hotelRoomRoutes.put(
  '/:id',
  authMiddleware,
  zodMiddleware({ body: hotelRoomUpdateSchema, params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelRoomController.update,
);

hotelRoomRoutes.get(
  '/:id',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelRoomController.getById,
);

hotelRoomRoutes.delete(
  '/:id',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
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
  zodMiddleware({ body: hotelRoomCreateSchema }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelRoomController.create,
);

export default hotelRoomRoutes;

import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { authHotelId } from '@/middleware/authHotelId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';
import { uuidParams, zodMiddleware } from '@/middleware/zodMiddleware';

import { HotelImageController } from './hotelImage.controller';
import { hotelImageCreateSchema, hotelImageUpdateSchema } from './hotelImage.schema';

const hotelImageRoutes = express.Router();
const hotelImageController = new HotelImageController();

hotelImageRoutes.put(
  '/:id',
  authMiddleware,
  zodMiddleware({ body: hotelImageUpdateSchema, params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelImageController.update,
);

hotelImageRoutes.get(
  '/:id',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelImageController.getById,
);

hotelImageRoutes.delete(
  '/:id',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelImageController.delete,
);

hotelImageRoutes.get(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelImageController.getAll,
);

hotelImageRoutes.post(
  '/',
  authMiddleware,
  zodMiddleware({ body: hotelImageCreateSchema }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  hotelImageController.create,
);

export default hotelImageRoutes;

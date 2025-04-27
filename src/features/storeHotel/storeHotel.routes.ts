import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { StoreHotelController } from './storeHotel.controller';

const storeHotelRoutes = express.Router();
const storeHotelController = new StoreHotelController();

storeHotelRoutes.get(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  storeHotelController.getAll,
);
storeHotelRoutes.get(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  storeHotelController.getById,
);
storeHotelRoutes.post(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  storeHotelController.create,
);

storeHotelRoutes.put(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  storeHotelController.update,
);

export default storeHotelRoutes;

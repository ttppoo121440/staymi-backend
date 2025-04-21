import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { StoreHotelController } from './storeHotel.controller';

const storeHotelRoutes = express.Router();
const storeHotelController = new StoreHotelController();

storeHotelRoutes.post(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store']),
  storeHotelController.createHotel.bind(storeHotelController),
);

export default storeHotelRoutes;

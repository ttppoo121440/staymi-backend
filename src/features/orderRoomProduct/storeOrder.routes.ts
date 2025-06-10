import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { authHotelId } from '@/middleware/authHotelId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';
import { zodMiddleware } from '@/middleware/zodMiddleware';

import { OrderRoomProductController } from './orderRoomProduct.controller';
import { orderStoreQuerySchema } from './orderRoomProduct.schema';

const storeOrderRoutes = express.Router();
const orderRoomProductController = new OrderRoomProductController();

storeOrderRoutes.get(
  '/',
  authMiddleware,
  zodMiddleware({ query: orderStoreQuerySchema }),
  checkRolesMiddleware(['store']),
  authBrandId,
  authHotelId,
  orderRoomProductController.getAllByHotelId,
);

export default storeOrderRoutes;

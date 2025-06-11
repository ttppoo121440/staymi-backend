import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { OrderRoomProductItemController } from './orderRoomProductItem.controller';

const adminOrderRoomProductItemRoutes = express.Router();
const orderRoomProductItemController = new OrderRoomProductItemController();

adminOrderRoomProductItemRoutes.get(
  '/total',
  authMiddleware,
  checkRolesMiddleware(['admin']),
  orderRoomProductItemController.getSouvenirSalesDashboard,
);

export default adminOrderRoomProductItemRoutes;

import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { OrderRoomProductController } from './orderRoomProduct.controller';

const adminOrderRoutes = express.Router();
const orderRoomProductController = new OrderRoomProductController();

adminOrderRoutes.get(
  '/count',
  authMiddleware,
  checkRolesMiddleware(['admin']),
  orderRoomProductController.getTotalOrderCountForAdmin,
);
adminOrderRoutes.get(
  '/all',
  authMiddleware,
  checkRolesMiddleware(['admin']),
  orderRoomProductController.getAllForAdmin,
);

export default adminOrderRoutes;

import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';

import { OrderRoomProductController } from './orderRoomProduct.controller';

const orderRoomProductRoutes = express.Router();
const orderRoomProductController = new OrderRoomProductController();

orderRoomProductRoutes.get('/', authMiddleware, orderRoomProductController.getAll);
orderRoomProductRoutes.post('/', authMiddleware, orderRoomProductController.create);

export default orderRoomProductRoutes;

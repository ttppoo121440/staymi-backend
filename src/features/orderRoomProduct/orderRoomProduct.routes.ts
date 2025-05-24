import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { uuidParams, zodMiddleware } from '@/middleware/zodMiddleware';

import { OrderRoomProductController } from './orderRoomProduct.controller';
import {
  orderBodySchema,
  orderQuerySchema,
  orderRoomProductCreateSchema,
  orderRoomProductUpdateSchema,
} from './orderRoomProduct.schema';

const orderRoomProductRoutes = express.Router();
const orderRoomProductController = new OrderRoomProductController();

orderRoomProductRoutes.get(
  '/',
  authMiddleware,
  zodMiddleware({ query: orderQuerySchema }),
  orderRoomProductController.getAll,
);
orderRoomProductRoutes.get(
  '/:id',
  authMiddleware,
  zodMiddleware({
    params: uuidParams('id'),
    body: orderBodySchema,
  }),
  orderRoomProductController.getById,
);
orderRoomProductRoutes.post(
  '/',
  authMiddleware,
  zodMiddleware({
    body: orderRoomProductCreateSchema,
  }),
  orderRoomProductController.create,
);
orderRoomProductRoutes.put(
  '/:id',
  authMiddleware,
  zodMiddleware({
    params: uuidParams('id'),
    body: orderRoomProductUpdateSchema,
  }),
  orderRoomProductController.updateOrder,
);

export default orderRoomProductRoutes;

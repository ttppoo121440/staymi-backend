import { Router } from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { zodMiddleware } from '@/middleware/zodMiddleware';

import { orderRoomProductCreateSchema } from '../orderRoomProduct/orderRoomProduct.schema';

import { PayPalController } from './paypal.controller';
import { paypalSchema } from './paypal.schema';

const paypalRouter = Router();
const payPalController = new PayPalController();

paypalRouter.post(
  '/create-order',
  authMiddleware,
  zodMiddleware({
    body: orderRoomProductCreateSchema,
  }),
  payPalController.createPayPalOrder,
);
paypalRouter.post(
  '/capture-order/:id',
  authMiddleware,
  zodMiddleware({
    body: paypalSchema,
  }),
  payPalController.capturePayPalOrder,
);

export default paypalRouter;

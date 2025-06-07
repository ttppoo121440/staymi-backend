import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { PaymentController } from './payment.controller';

const adminPaymentRoutes = express.Router();
const paymentController = new PaymentController();

adminPaymentRoutes.get(
  '/revenue',
  authMiddleware,
  checkRolesMiddleware(['admin']),
  paymentController.getTotalConfirmedRevenue,
);
adminPaymentRoutes.get('/recent', authMiddleware, checkRolesMiddleware(['admin']), paymentController.getRecentPayment);

export default adminPaymentRoutes;

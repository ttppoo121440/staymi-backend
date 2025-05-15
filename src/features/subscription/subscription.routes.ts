import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';
import { zodMiddleware } from '@/middleware/zodMiddleware';

import { SubscriptionController } from './subscription.controller';
import {
  subscriptionIsRecurringBodySchema,
  subscriptionHistoryQuerySchema,
  subscriptionPlanBodySchema,
} from './subscription.schema';

const subscriptionRoutes = express.Router();
const subscriptionController = new SubscriptionController();

// 查詢個人訂閱狀態
subscriptionRoutes.get('/', authMiddleware, checkRolesMiddleware(['consumer']), subscriptionController.getPlan);

// 取消自動訂閱狀態
subscriptionRoutes.put(
  '/is-recurring',
  authMiddleware,
  checkRolesMiddleware(['consumer']),
  zodMiddleware({
    body: subscriptionIsRecurringBodySchema,
  }),
  subscriptionController.updateIsRecurring,
);

// 查詢訂閱紀錄
subscriptionRoutes.get(
  '/history',
  authMiddleware,
  checkRolesMiddleware(['consumer']),
  zodMiddleware({
    query: subscriptionHistoryQuerySchema,
  }),
  subscriptionController.getPlanHistory,
);

// 變更訂閱方案
subscriptionRoutes.put(
  '/plan',
  authMiddleware,
  checkRolesMiddleware(['consumer']),
  zodMiddleware({
    body: subscriptionPlanBodySchema,
  }),
  subscriptionController.updatePlan,
);

export default subscriptionRoutes;

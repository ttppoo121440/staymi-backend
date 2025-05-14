import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';

import { SubscriptionController } from './subscription.controller';

const subscriptionRoutes = express.Router();
const subscriptionController = new SubscriptionController();

// 查詢個人訂閱狀態
subscriptionRoutes.get('/', authMiddleware, subscriptionController.getPlan);

// 取消自動訂閱狀態
subscriptionRoutes.put('/is-recurring', authMiddleware, subscriptionController.updateIsRecurring);

export default subscriptionRoutes;

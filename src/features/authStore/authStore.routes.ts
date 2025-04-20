import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { AuthStoreController } from './authStore.controller';

const authStoreRoutes = express.Router();
const authStoreController = new AuthStoreController();

authStoreRoutes.post('/signup', authStoreController.signup.bind(authStoreController));
authStoreRoutes.put(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store']),
  authStoreController.updateStoreInfo.bind(authStoreController),
);

export default authStoreRoutes;

import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { AuthStoreController } from './authStore.controller';

const authStoreRoutes = express.Router();
const authStoreController = new AuthStoreController();

authStoreRoutes.post('/signup', authStoreController.signup);
authStoreRoutes.post('/login', authStoreController.storeLogin);
authStoreRoutes.put(
  '/uploadLogo',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authStoreController.uploadLogo,
);
authStoreRoutes.put(
  '/brand',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authStoreController.updateStoreInfo,
);

export default authStoreRoutes;

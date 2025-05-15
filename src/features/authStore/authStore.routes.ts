import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';
import { zodMiddleware } from '@/middleware/zodMiddleware';

import { AuthLoginSchema } from '../auth/auth.schema';

import { AuthStoreController } from './authStore.controller';
import { authStoreSignupSchema, authStoreUpdateSchema, authStoreUploadLogoSchema } from './authStore.schema';

const authStoreRoutes = express.Router();
const authStoreController = new AuthStoreController();

authStoreRoutes.post('/signup', zodMiddleware({ body: authStoreSignupSchema }), authStoreController.signup);
authStoreRoutes.post('/login', zodMiddleware({ body: AuthLoginSchema }), authStoreController.storeLogin);
authStoreRoutes.put(
  '/uploadLogo',
  authMiddleware,
  zodMiddleware({ body: authStoreUploadLogoSchema }),
  checkRolesMiddleware(['store', 'admin']),
  authStoreController.uploadLogo,
);
authStoreRoutes.put(
  '/brand',
  authMiddleware,
  zodMiddleware({ body: authStoreUpdateSchema }),
  checkRolesMiddleware(['store', 'admin']),
  authStoreController.updateStoreInfo,
);

export default authStoreRoutes;

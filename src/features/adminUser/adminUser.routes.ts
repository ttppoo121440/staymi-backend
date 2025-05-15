import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';
import { uuidParams, zodMiddleware } from '@/middleware/zodMiddleware';

import { AdminUserController } from './adminUser.controller';
import { adminUserUpdateRoleSchema } from './adminUser.schema';

const adminUserRoutes = express.Router();
const adminUserController = new AdminUserController();

adminUserRoutes.get('/', authMiddleware, checkRolesMiddleware(['admin']), adminUserController.getAll);
adminUserRoutes.get(
  '/:id',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
  checkRolesMiddleware(['admin']),
  adminUserController.getById,
);
adminUserRoutes.put(
  '/:id/role',
  authMiddleware,
  zodMiddleware({ body: adminUserUpdateRoleSchema, params: uuidParams('id') }),
  checkRolesMiddleware(['admin']),
  adminUserController.updateRole,
);

export default adminUserRoutes;

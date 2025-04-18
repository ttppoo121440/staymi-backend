import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { AdminUserController } from './adminUser.controller';

const adminUserRoutes = express.Router();
const adminUserController = new AdminUserController();

adminUserRoutes.get(
  '/',
  authMiddleware,
  checkRolesMiddleware(['admin']),
  adminUserController.getAll.bind(adminUserController),
);
adminUserRoutes.get(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['admin']),
  adminUserController.getById.bind(adminUserController),
);
adminUserRoutes.put(
  '/:id/role',
  authMiddleware,
  checkRolesMiddleware(['admin']),
  adminUserController.updateRole.bind(adminUserController),
);

export default adminUserRoutes;

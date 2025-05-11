import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { authHotelId } from '@/middleware/authHotelId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { ProductPlanController } from './productPlan.controller';

const productPlanRoutes = express.Router();
const productPlanController = new ProductPlanController();

productPlanRoutes.patch(
  '/:id/active',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  productPlanController.toggleActive,
);

productPlanRoutes.put(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  productPlanController.update,
);

productPlanRoutes.get(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  productPlanController.getById,
);

productPlanRoutes.delete(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  productPlanController.delete,
);

productPlanRoutes.get(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  productPlanController.getAll,
);

productPlanRoutes.post(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  productPlanController.create,
);

export default productPlanRoutes;

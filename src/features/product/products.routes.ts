import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { authHotelId } from '@/middleware/authHotelId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';
import { uuidParams, zodMiddleware } from '@/middleware/zodMiddleware';

import { ProductsController } from './products.controller';
import { productsCreateSchema, productsUpdateSchema } from './products.schema';

const productsRoutes = express.Router();
const productsController = new ProductsController();

productsRoutes.put(
  '/:id',
  authMiddleware,
  zodMiddleware({ body: productsUpdateSchema, params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  productsController.update,
);

productsRoutes.get(
  '/:id',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  productsController.getById,
);

productsRoutes.patch(
  '/:id',
  authMiddleware,
  zodMiddleware({ params: uuidParams('id') }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  productsController.softDelete,
);

productsRoutes.get(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  productsController.getAll,
);

productsRoutes.post(
  '/',
  authMiddleware,
  zodMiddleware({ body: productsCreateSchema }),
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  authHotelId,
  productsController.create,
);

export default productsRoutes;

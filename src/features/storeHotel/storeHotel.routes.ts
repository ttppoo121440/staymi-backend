import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { authBrandId } from '@/middleware/authBrandId.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { HotelImageController } from '../hotelImage/hotelImage.controller';
import { ProductsController } from '../product/products.controller';

import { StoreHotelController } from './storeHotel.controller';

const storeHotelRoutes = express.Router();
const storeHotelController = new StoreHotelController();
const hotelImageController = new HotelImageController();
const productsController = new ProductsController();

storeHotelRoutes.get(
  '/:hotelId/products',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  productsController.getAll,
);
storeHotelRoutes.get(
  '/:hotelId/products/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  productsController.getById,
);
storeHotelRoutes.post(
  '/:hotelId/products',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  productsController.create,
);
storeHotelRoutes.put(
  '/:hotelId/products/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  productsController.update,
);

storeHotelRoutes.get(
  '/:hotelId/images',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  hotelImageController.getAll,
);
storeHotelRoutes.post(
  '/:hotelId/images',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  hotelImageController.create,
);
storeHotelRoutes.get(
  '/:hotelId/images/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  hotelImageController.getById,
);
storeHotelRoutes.put(
  '/:hotelId/images/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  hotelImageController.update,
);

storeHotelRoutes.delete(
  '/:hotelId/images/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  hotelImageController.delete,
);

storeHotelRoutes.get(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  storeHotelController.getAll,
);
storeHotelRoutes.get(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  storeHotelController.getById,
);
storeHotelRoutes.post(
  '/',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  storeHotelController.create,
);

storeHotelRoutes.put(
  '/:id',
  authMiddleware,
  checkRolesMiddleware(['store', 'admin']),
  authBrandId,
  storeHotelController.update,
);

export default storeHotelRoutes;

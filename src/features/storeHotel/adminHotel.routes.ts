import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { StoreHotelController } from './storeHotel.controller';

const adminHotelRoutes = express.Router();
const storeHotelController = new StoreHotelController();

adminHotelRoutes.get('/', authMiddleware, checkRolesMiddleware(['admin']), storeHotelController.getAllList);
adminHotelRoutes.get('/count', authMiddleware, checkRolesMiddleware(['admin']), storeHotelController.getHotelCount);

export default adminHotelRoutes;

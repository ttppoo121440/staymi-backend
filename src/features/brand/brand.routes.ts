import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkRolesMiddleware } from '@/middleware/checkRoles.middleware';

import { BrandController } from './brand.controller';

const brandRoutes = express.Router();
const brandController = new BrandController();

brandRoutes.get('/count', authMiddleware, checkRolesMiddleware(['admin']), brandController.getBrandCount);

export default brandRoutes;

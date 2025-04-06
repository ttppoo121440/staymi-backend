import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';

import { Credit_purchaseController } from '../credit_purchase/credit_purchase.controller';

import { Credit_packageController } from './credit_package.controller';

const credit_packageRoutes = express.Router();
const credit_packageController = new Credit_packageController();
const credit_purchaseController = new Credit_purchaseController();

credit_packageRoutes.get('/', credit_packageController.getAll.bind(credit_packageController));
credit_packageRoutes.post('/', (req, res) => credit_packageController.create(req, res));
credit_packageRoutes.post('/:creditPackageId', authMiddleware, (req, res) =>
  credit_purchaseController.create(req, res),
);
credit_packageRoutes.delete('/:id', (req, res) => credit_packageController.delete(req, res));

export default credit_packageRoutes;

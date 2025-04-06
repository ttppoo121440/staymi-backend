import express from 'express';

import { Credit_purchaseController } from './credit_purchase.controller';

const credit_purchaseRoutes = express.Router();
const credit_purchaseController = new Credit_purchaseController();

credit_purchaseRoutes.get('/', credit_purchaseController.getAll.bind(credit_purchaseController));

export default credit_purchaseRoutes;

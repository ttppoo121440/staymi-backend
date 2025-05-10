import { Router } from 'express';

import { PayPalController } from './paypal.controller';

const paypalRouter = Router();
const payPalController = new PayPalController();

paypalRouter.post('/create-order', payPalController.createPayPalOrder);
paypalRouter.post('/capture-order/:orderId', payPalController.capturePayPalOrder);

export default paypalRouter;

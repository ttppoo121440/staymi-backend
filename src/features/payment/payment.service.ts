import { db } from '@/config/database';

import { PaymentOrderRoomProductRepo } from '../payment_order_room_product/payment_order_room_product.repo';
import { PaymentOrderSubscriptionRepo } from '../paymentOrderSubscription/paymentOrderSubscription.repo';

import { PaymentRepo } from './payment.repo';
import { PaymentCreateType } from './payment.schema';

export class PaymentService {
  constructor(
    private paymentRepo = new PaymentRepo(),
    private paymentOrderRoomProductRepo = new PaymentOrderRoomProductRepo(),
    private paymentOrderSubscriptionRepo = new PaymentOrderSubscriptionRepo(),
  ) {}

  async createPayment(orderId: string, data: PaymentCreateType): Promise<unknown> {
    return db.transaction(async (tx) => {
      const existing = await this.paymentOrderRoomProductRepo.getById(tx, orderId);
      if (existing) {
        console.log('Payment Order Room Product already exists:', existing);
        return existing;
      }
      const payment = await this.paymentRepo.create(tx, data);
      const paymentOrderRoomProduct = await this.paymentOrderRoomProductRepo.create(tx, {
        transaction_id: payment.id,
        order_id: orderId,
        created_at: new Date(),
      });
      console.log('Payment Order Room Product:', paymentOrderRoomProduct);

      return payment;
    });
  }

  async createSubscriptionPayment(orderId: string, data: PaymentCreateType): Promise<unknown> {
    return db.transaction(async (tx) => {
      const existing = await this.paymentOrderSubscriptionRepo.getById(tx, orderId);
      if (existing) {
        console.log('Payment Order Subscription already exists:', existing);
        return existing;
      }
      // 新增至payment_transaction
      const payment = await this.paymentRepo.create(tx, data);
      const paymentOrderSubscription = await this.paymentOrderSubscriptionRepo.create(tx, {
        transaction_id: payment.id,
        order_id: orderId,
        created_at: new Date(),
      });
      console.log('Payment Order Subscription: ', paymentOrderSubscription);

      return payment;
    });
  }
}

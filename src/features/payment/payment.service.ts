import { db } from '@/config/database';

import { PaymentOrderRoomProductRepo } from '../payment_order_room_product/payment_order_room_product.repo';

import { PaymentRepo } from './payment.repo';
import { PaymentCreateType } from './payment.schema';

export class PaymentService {
  constructor(
    private paymentRepo = new PaymentRepo(),
    private paymentOrderRoomProductRepo = new PaymentOrderRoomProductRepo(),
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
}

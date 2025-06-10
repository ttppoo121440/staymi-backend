import { eq } from 'drizzle-orm';

import { payment_order_subscription } from '@/database/schemas/payment_order_subscription.schema';
import { DatabaseOrTransaction } from '@/types/databaseType';

import { paymentOrderSubscriptionType } from './paymentOrderSubscription.schema';

export class PaymentOrderSubscriptionRepo {
  async create(
    dbInstance: DatabaseOrTransaction,
    data: paymentOrderSubscriptionType,
  ): Promise<paymentOrderSubscriptionType> {
    const result = await dbInstance.insert(payment_order_subscription).values(data).returning();
    return result[0];
  }

  async getById(dbInstance: DatabaseOrTransaction, orderId: string): Promise<paymentOrderSubscriptionType | null> {
    const result = await dbInstance
      .select()
      .from(payment_order_subscription)
      .where(eq(payment_order_subscription.order_id, orderId));
    return result[0] ?? null;
  }
}

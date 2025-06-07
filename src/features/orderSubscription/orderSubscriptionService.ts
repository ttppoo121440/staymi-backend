import { db } from '@/config/database';

import { SubscriptionRepo } from '../subscription/subscription.repo';
import { subscriptionCreateType } from '../subscription/subscription.schema';

import { OrderSubscriptionRepo } from './orderSubscription.repo';
import { orderSubscriptionCreateSchema, orderSubscriptionCreateType } from './orderSubscription.schema';

export class OrderSubscriptionService {
  constructor(
    private subscriptionRepo = new SubscriptionRepo(),
    private orderSubscriptionRepo = new OrderSubscriptionRepo(),
  ) {}

  async createOrderSubscriptionService(data: subscriptionCreateType): Promise<orderSubscriptionCreateType> {
    return await db.transaction(async (tx) => {
      const subscription = await this.subscriptionRepo.create(tx, data);

      const orderData: orderSubscriptionCreateType = {
        user_id: subscription.user_id,
        subscription_id: subscription.id,
        cycle: data.cycle,
        status: subscription.status as 'active' | 'paused' | 'cancelled',
        next_billing_date: subscription.end_at,
      };
      const result = await this.orderSubscriptionRepo.create(tx, orderData);
      return orderSubscriptionCreateSchema.parse(result);
    });
  }
}

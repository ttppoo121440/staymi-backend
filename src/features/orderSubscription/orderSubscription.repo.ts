import { and, eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { order_subscription } from '@/database/schemas/order_subscription.schema';
import { DatabaseOrTransaction } from '@/types/databaseType';

import { orderSubscriptionCreateType, orderSubscriptionDTOType } from './orderSubscription.schema';

export class OrderSubscriptionRepo {
  // 新增訂閱訂單
  async create(
    dbInstance: DatabaseOrTransaction,
    data: orderSubscriptionCreateType,
  ): Promise<orderSubscriptionCreateType> {
    const newData = {
      ...data,
      next_billing_date: data.next_billing_date ? data.next_billing_date.toISOString() : null,
    };

    const result = await dbInstance.insert(order_subscription).values(newData).returning();

    return {
      ...result[0],
      next_billing_date: result[0].next_billing_date ? new Date(result[0].next_billing_date) : null,
    };
  }

  // 根據訂閱ID和用戶ID獲取訂閱訂單
  async getBySubscriptionIdAndUserId(subscriptionId: string, userId: string): Promise<orderSubscriptionDTOType | null> {
    const result = await db
      .select()
      .from(order_subscription)
      .where(and(eq(order_subscription.subscription_id, subscriptionId), eq(order_subscription.user_id, userId)));

    return {
      ...result[0],
      next_billing_date: result[0].next_billing_date ? new Date(result[0].next_billing_date) : null,
    };
  }

  // async update
}

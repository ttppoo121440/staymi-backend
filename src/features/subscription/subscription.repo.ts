import { eq, and, desc } from 'drizzle-orm';

import { db } from '@/config/database';
import { subscriptions } from '@/database/schemas/subscriptions.schema';

import { subscriptionType, subscriptionIsRecurringType } from './subscription.schema';

export class SubscriptionRepo {
  async getPlanByUserId(userId: string): Promise<subscriptionType | null> {
    const result = await db
      .select({
        plan: subscriptions.plan,
        end_at: subscriptions.end_at,
      })
      .from(subscriptions)
      .where(eq(subscriptions.user_id, userId));

    return result[0] ?? null;
  }

  async getLatestIsRecurringByUserId(userId: string): Promise<subscriptionIsRecurringType | null> {
    const result = await db
      .select({
        is_recurring: subscriptions.is_recurring,
      })
      .from(subscriptions)
      .where(eq(subscriptions.user_id, userId))
      .orderBy(desc(subscriptions.created_at))
      .limit(1);

    return result[0] ?? null;
  }

  async updateIsRecurringByUserIdAndIsRecurring(
    userId: string,
    isRecurring: boolean,
  ): Promise<subscriptionIsRecurringType | null> {
    const result = await db
      .update(subscriptions)
      .set({ is_recurring: isRecurring })
      .where(and(eq(subscriptions.user_id, userId), eq(subscriptions.is_recurring, !isRecurring)))
      .returning();

    return result[0] ?? null;
  }
}

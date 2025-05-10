import { eq } from 'drizzle-orm';

import { db } from '@/config/database';
import { subscriptions } from '@/database/schemas/subscriptions.schema';

import { subscriptionType } from './subscription.schema';

export class SubscriptionRepo {
  async getByUserId(userId: string): Promise<subscriptionType | null> {
    const result = await db
      .select({
        plan: subscriptions.plan,
        end_at: subscriptions.end_at,
      })
      .from(subscriptions)
      .where(eq(subscriptions.user_id, userId));

    return result[0] ?? null;
  }
}

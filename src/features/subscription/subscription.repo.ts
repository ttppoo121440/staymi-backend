import { eq, and, desc, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { subscriptions } from '@/database/schemas/subscriptions.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { PaginationType } from '@/types/pagination';

import {
  subscriptionType,
  subscriptionIsRecurringType,
  subscriptionHistoryType,
  subscriptionPlanType,
} from './subscription.schema';

export class SubscriptionRepo extends BaseRepository {
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

  async getPlanHistoryByUserId(
    userId: string,
    currentPage: number,
    perPage: number,
  ): Promise<{ history: subscriptionHistoryType[]; pagination: PaginationType }> {
    const { data, pagination } = await this.paginateQuery<subscriptionHistoryType>(
      (limit, offset) =>
        db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.user_id, userId))
          .orderBy(desc(subscriptions.created_at))
          .limit(limit)
          .offset(offset),
      async () => {
        const totalItemsResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(subscriptions)
          .where(eq(subscriptions.user_id, userId));
        return Number(totalItemsResult[0]?.count ?? 0);
      },
      currentPage,
      perPage,
    );

    return {
      history: data,
      pagination,
    };
  }

  async updatePlanByUserIdAndPlan(userId: string, plan: 'free' | 'plus' | 'pro'): Promise<subscriptionPlanType | null> {
    const latest = await db
      .select({ id: subscriptions.id, plan: subscriptions.plan })
      .from(subscriptions)
      .where(eq(subscriptions.user_id, userId))
      .orderBy(desc(subscriptions.created_at))
      .limit(1);
    // 無訂閱資訊
    if (latest.length === 0) {
      return null;
    }
    // 與當前訂閱方案相同
    if (latest[0].plan === plan) {
      return { plan: latest[0].plan, isUpdate: false };
    }

    const result = await db
      .update(subscriptions)
      .set({ plan })
      .where(and(eq(subscriptions.user_id, userId), eq(subscriptions.id, latest[0].id)))
      .returning();

    if (!result[0]) {
      return null;
    }
    return { plan: result[0].plan, isUpdate: true };
  }
}

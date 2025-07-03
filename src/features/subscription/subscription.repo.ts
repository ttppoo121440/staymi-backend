import { eq, and, desc, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { subscriptions } from '@/database/schemas/subscriptions.schema';
import { BaseRepository } from '@/repositories/base-repository';
import { DatabaseOrTransaction } from '@/types/databaseType';
import { PaginationType } from '@/types/pagination';

import {
  subscriptionType,
  subscriptionIsRecurringType,
  subscriptionHistoryType,
  subscriptionPlanType,
  subscriptionCreateType,
  subscriptionPayPalToDTOType,
  subscriptionBaseType,
} from './subscription.schema';

export class SubscriptionRepo extends BaseRepository {
  async create(dbInstance: DatabaseOrTransaction, data: subscriptionCreateType): Promise<subscriptionBaseType> {
    const { cycle } = data;
    const startedAt = data.started_at ? new Date(data.started_at) : new Date();
    const end_at: Date = new Date(startedAt);
    switch (cycle) {
      case 'monthly':
        end_at.setDate(end_at.getDate() + 30);
        break;
      case 'quarterly':
        end_at.setDate(end_at.getDate() + 90);
        break;
      case 'yearly':
        end_at.setDate(end_at.getDate() + 365);
        break;
      default:
        throw new Error('週期格式錯誤');
    }
    // 存進DB時時區問題
    end_at.setHours(23 - end_at.getTimezoneOffset() / 60, 59, 59, 999);

    const cleanedData = {
      ...data,
      status: 'paused',
      started_at: startedAt,
      end_at: end_at,
    };
    const result = await dbInstance.insert(subscriptions).values(cleanedData).returning();

    return result[0];
  }

  /**
   * 產生預設訂閱資料
   */
  async createDefaultSubscription(userId: string, data: subscriptionCreateType): Promise<subscriptionBaseType> {
    const startedAt = new Date();
    const endAt = new Date(startedAt);

    // 設定訂閱期限
    if (data.plan === 'free') {
      // 免費方案設定為永久有效 (一年後)
      endAt.setFullYear(endAt.getFullYear() + 1);
    } else {
      // 付費方案預設30天
      endAt.setDate(endAt.getDate() + 30);
      switch (data.cycle) {
        case 'monthly':
          endAt.setDate(endAt.getDate() + 30);
          break;
        case 'quarterly':
          endAt.setDate(endAt.getDate() + 90);
          break;
        case 'yearly':
          endAt.setDate(endAt.getDate() + 365);
          break;
        default:
          throw new Error('週期格式錯誤');
      }
    }

    // 調整時區
    endAt.setHours(23 - endAt.getTimezoneOffset() / 60, 59, 59, 999);

    const subscriptionData = {
      user_id: userId,
      plan: data.plan,
      status: data.plan === 'free' ? 'active' : 'paused', // 免費方案直接啟用，付費方案等待付款
      started_at: startedAt,
      end_at: endAt,
      is_recurring: false,
    };

    const result = await db.insert(subscriptions).values(subscriptionData).returning();
    return result[0];
  }

  // 根據ID & 用戶ID 獲取訂閱資訊
  async getByIdAndUserId(id: string, userId: string): Promise<subscriptionPayPalToDTOType | null> {
    const result = await db
      .select({
        id: subscriptions.id,
        user_id: subscriptions.user_id,
        plan: subscriptions.plan,
      })
      .from(subscriptions)
      .where(and(eq(subscriptions.id, id), eq(subscriptions.user_id, userId)));

    return result[0] ?? null;
  }

  async getPlanByUserId(userId: string): Promise<subscriptionType | null> {
    const result = await db
      .select({
        plan: subscriptions.plan,
        end_at: subscriptions.end_at,
      })
      .from(subscriptions)
      .where(and(eq(subscriptions.user_id, userId), eq(subscriptions.status, 'active')))
      .orderBy(desc(subscriptions.created_at))
      .limit(1);

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

  async updateSubscriptionStatus(
    subscriptionId: string,
    userId: string,
    status: 'active' | 'paused' | 'cancelled',
  ): Promise<subscriptionBaseType | null> {
    await this.updateSubscriptionCancelledStatus(userId);
    // 更新訂閱狀態
    const result = await db
      .update(subscriptions)
      .set({ status: status, updated_at: new Date() })
      .where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.user_id, userId)))
      .returning();

    return result[0] ?? null;
  }

  async updateSubscriptionCancelledStatus(userId: string): Promise<subscriptionBaseType | null> {
    const result = await db
      .update(subscriptions)
      .set({ status: 'cancelled', updated_at: new Date() })
      .where(eq(subscriptions.user_id, userId))
      .returning();

    return result[0] ?? null;
  }
}

import { desc, eq, sql } from 'drizzle-orm';

import { db } from '@/config/database';
import { payment_transaction } from '@/database/schemas/payment_transaction.schema';
import { user } from '@/database/schemas/user.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { DatabaseOrTransaction } from '@/types/databaseType';

import { PaymentCreateType, PaymentType, RecentPaymentType } from './payment.schema';

export class PaymentRepo {
  async create(dbInstance: DatabaseOrTransaction, data: PaymentCreateType): Promise<PaymentType> {
    const result = await dbInstance.insert(payment_transaction).values(data).returning();
    const { fee, net_income, ...rest } = result[0];
    return {
      ...rest,
      fee: fee ?? 0,
      net_income: net_income ?? 0,
    };
  }
  async getTotalConfirmedRevenue(): Promise<number> {
    const result = await db
      .select({ total: sql<number>`SUM(${payment_transaction.amount})` })
      .from(payment_transaction)
      .where(eq(payment_transaction.status, 'confirmed'));

    return Number(result[0]?.total ?? 0);
  }
  async getRecentPayment(limit = 5): Promise<RecentPaymentType[]> {
    const result = await db
      .select({
        id: payment_transaction.id,
        order_type: payment_transaction.order_type,
        amount: payment_transaction.amount,
        name: user_profile.name,
        email: user.email,
        avatar: user_profile.avatar,
      })
      .from(payment_transaction)
      .innerJoin(user_profile, eq(payment_transaction.user_id, user_profile.user_id))
      .innerJoin(user, eq(payment_transaction.user_id, user.id))
      .orderBy(desc(payment_transaction.created_at))
      .limit(limit);

    return result.map((item) => ({
      ...item,
      email: item.email ?? '',
      avatar: item.avatar ?? undefined,
    }));
  }
}

import { payment_transaction } from '@/database/schemas/payment_transaction.schema';
import { DatabaseOrTransaction } from '@/types/databaseType';

import { PaymentCreateType, PaymentType } from './payment.schema';

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
}

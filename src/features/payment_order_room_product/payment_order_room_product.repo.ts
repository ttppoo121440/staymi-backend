import { eq } from 'drizzle-orm';

import { payment_order_room_product } from '@/database/schemas/payment_order_room_product.schema';
import { DatabaseOrTransaction } from '@/types/databaseType';

import { PaymentOrderRoomProductType } from './payment_order_room_product.schema';

export class PaymentOrderRoomProductRepo {
  async create(
    dbInstance: DatabaseOrTransaction,
    data: PaymentOrderRoomProductType,
  ): Promise<PaymentOrderRoomProductType> {
    const result = await dbInstance.insert(payment_order_room_product).values(data).returning();
    return result[0];
  }
  async getById(dbInstance: DatabaseOrTransaction, orderId: string): Promise<PaymentOrderRoomProductType | null> {
    const result = await dbInstance
      .select()
      .from(payment_order_room_product)
      .where(eq(payment_order_room_product.order_id, orderId));
    return result[0] ?? null;
  }
}

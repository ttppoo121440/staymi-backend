import { db } from '@/config/database';
import { HttpStatus } from '@/types/http-status.enum';
import { appError } from '@/utils/appError';
import { SubscriptionService } from '@/utils/services/subscription.service';

import { OrderRoomProductItemRepo } from '../orderRoomProductItem/orderRoomProductItem.repo';
import { orderRoomProductItemCreateSchema } from '../orderRoomProductItem/orderRoomProductItem.schema';
import { ProductPlanRepo } from '../productPlan/productPlan.repo';
import { RoomPlanRepo } from '../roomPlan/roomPlan.repo';
import { StoreHotelRepo } from '../storeHotel/storeHotel.repo';

import { OrderRoomProductRepo } from './orderRoomProduct.repo';
import { OrderRoomProductCreateType, orderRoomProductDto, OrderRoomProductDtoType } from './orderRoomProduct.schema';

export class OrderRoomProductService {
  constructor(
    private orderRoomProductRepo: OrderRoomProductRepo,
    private roomPlanRepo: RoomPlanRepo,
    private productPlanRepo: ProductPlanRepo,
    private orderRoomProductItemRepo: OrderRoomProductItemRepo,
    private storeHotelRepo: StoreHotelRepo,
    private subscriptionService: SubscriptionService,
  ) {}

  async createOrder(data: OrderRoomProductCreateType): Promise<OrderRoomProductDtoType> {
    return await db.transaction(async (tx) => {
      const { user_id, hotel_id, product_plans_id, room_plans_id, check_in_date, check_out_date, quantity } = data;

      // 驗證飯店存在
      await this.storeHotelRepo.getById({ hotelId: hotel_id });

      let total_price = 0;
      let createdProductItem = null;
      let updatedOrderTotalPrice = null;

      // 驗證入住與退房日期
      if (!check_in_date || !check_out_date) {
        throw appError('入住日期和退房日期不能為空', HttpStatus.BAD_REQUEST);
      }

      if (check_in_date < new Date(new Date().setHours(0, 0, 0, 0))) {
        throw appError('check_in_date 不可為過去日期', HttpStatus.BAD_REQUEST);
      }

      const days = this.calculateDays(check_in_date, check_out_date);
      if (days <= 0) throw appError('退房日期必須晚於入住日期', HttpStatus.BAD_REQUEST);

      // 查詢房型價格
      const roomPlanList = await this.roomPlanRepo.getPriceById(room_plans_id);
      if (roomPlanList.length === 0) throw appError('找不到對應的住宿計畫', HttpStatus.NOT_FOUND);
      const roomPlan = roomPlanList[0];

      const isSubscribed = await this.subscriptionService.isActiveSubscription(user_id);
      const roomPrice = this.subscriptionService.calculateRoomPlanPrice({ isSubscribed, roomPlan, days });

      total_price += roomPrice;

      // 建立訂單（還不知道是否有伴手禮，所以先算住宿價）
      const result = await this.orderRoomProductRepo.create(tx, total_price, data);
      const order_id = result.order.id;
      let finalOrder = result.order;

      // 若有伴手禮商品，建立對應的訂單項目
      if (product_plans_id) {
        if (typeof quantity !== 'number' || quantity <= 0) {
          throw appError('請填寫數量', HttpStatus.BAD_REQUEST);
        }

        const productPlan = await this.productPlanRepo.getById({ id: product_plans_id, hotelId: hotel_id });
        if (!productPlan) throw appError('找不到對應的產品計畫', HttpStatus.NOT_FOUND);

        const unitPrice = productPlan.price;
        const validatedItem = orderRoomProductItemCreateSchema.parse({
          order_id,
          product_plans_id,
          quantity,
          unit_price: unitPrice,
        });

        // 加總價格前，先取得數量與單價
        const itemTotal = validatedItem.quantity * validatedItem.unit_price;
        total_price += itemTotal;

        const orderItem = await this.orderRoomProductItemRepo.create(tx, {
          ...validatedItem,
          order_id, // 使用剛剛建立的訂單 ID
          unit_price: unitPrice,
        });
        createdProductItem = orderItem.souvenir;

        // 更新訂單總價（伴手禮價格算進來）
        updatedOrderTotalPrice = await this.orderRoomProductRepo.updateTotalPrice(tx, order_id, total_price);
        finalOrder = updatedOrderTotalPrice.order[0];
      }

      return orderRoomProductDto.parse({
        order: finalOrder,
        order_item: createdProductItem ?? undefined,
      });
    });
  }

  private calculateDays(checkIn: string | Date, checkOut: string | Date): number {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = outDate.getTime() - inDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}

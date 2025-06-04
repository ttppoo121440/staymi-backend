import axios from 'axios';

import {
  PayPalCaptureOrderResponse,
  PayPalCreateOrderResponse,
  PayPalOrderResult,
  PayPalSubscriptionResult,
} from '@/features/paypal/paypal.type';
import { createPayPalAccessToken, paypalApi } from '@/libs/paypalClient';
import { HttpStatus } from '@/types/http-status.enum';
import { appError } from '@/utils/appError';

import { OrderRoomProductRepo } from '../orderRoomProduct/orderRoomProduct.repo';
import { orderDetailType } from '../orderRoomProduct/orderRoomProduct.schema';
import { OrderSubscriptionRepo } from '../orderSubscription/orderSubscription.repo';
import { PaymentService } from '../payment/payment.service';
import { SubscriptionRepo } from '../subscription/subscription.repo';

export class PayPalService {
  constructor(
    private orderRoomProductRepo = new OrderRoomProductRepo(),
    private orderSubscriptionRepo = new OrderSubscriptionRepo(),
    private subscriptionRepo = new SubscriptionRepo(),
    private paymentService = new PaymentService(),
  ) {}
  async createOrder(orderId: string, userId: string): Promise<PayPalOrderResult> {
    const token = await createPayPalAccessToken();
    // 從資料庫撈出訂單明細
    const order = await this.orderRoomProductRepo.getById(orderId, userId);
    if (!order) {
      throw new Error('找不到訂單');
    }

    const res = await paypalApi.post<PayPalCreateOrderResponse>(
      '/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            custom_id: orderId,
            amount: {
              currency_code: 'TWD',
              value: order.total_price?.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'TWD',
                  value: order.total_price?.toFixed(2),
                },
              },
            },
            items: [
              {
                name: order.room_name,
                unit_amount: {
                  currency_code: 'TWD',
                  value: order.total_price?.toFixed(2),
                },
                quantity: '1',
              },
            ],
          },
        ],
        application_context: {
          locale: 'zh-TW',
          return_url: 'https://staymi.vercel.app/',
          cancel_url: 'https://staymi.vercel.app/login',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const { id, links } = res.data;
    const approveLink = links.find((link) => link.rel === 'approve')?.href;

    if (!approveLink) {
      throw new Error('找不到 approve link');
    }

    await this.orderRoomProductRepo.updatePaypalOrderId(orderId, userId, id);

    return {
      orderId: id,
      approveLink,
    };
  }

  async captureOrder(orderId: string): Promise<PayPalCaptureOrderResponse> {
    const token = await createPayPalAccessToken();

    try {
      const res = await paypalApi.post<PayPalCaptureOrderResponse>(
        `/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw appError('找不到對應的 PayPal 訂單', HttpStatus.NOT_FOUND);
        }
        if (error.response?.status === 401) {
          throw appError('PayPal 授權失敗', HttpStatus.UNAUTHORIZED);
        }
        if (error.response?.status === 422) {
          throw appError('此訂單已被處理或無法完成付款', HttpStatus.BAD_REQUEST);
        }

        console.error('PayPal API 錯誤:', error.response?.data || error.message);
        throw appError('PayPal 確認付款失敗', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      console.error('非 Axios 錯誤:', error);
      throw appError('系統錯誤，請稍後再試', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async markOrderAsPaid(user_id: string, paypalOrderId: string, paypalTransactionId: string): Promise<orderDetailType> {
    const orderResult = await this.orderRoomProductRepo.getById(paypalOrderId, user_id);

    if (!orderResult) {
      throw new Error('找不到對應的本地訂單');
    }

    const updatedResult = await this.orderRoomProductRepo.updateOrder(orderResult.id, user_id, {
      status: 'confirmed',
      paypal_transaction_id: paypalTransactionId,
    });

    if (!updatedResult) {
      throw new Error('更新訂單失敗');
    }
    const orderData = await this.orderRoomProductRepo.getById(paypalOrderId, user_id);
    if (!orderData) {
      throw new Error('找不到對應的本地訂單');
    }
    return orderData;
  }

  async captureAndMarkOrderAsPaid(
    user_id: string,
    paypalOrderId: string,
    options?: { order_type?: string; method?: string },
  ): Promise<orderDetailType> {
    const paypalData = await this.captureOrder(paypalOrderId);

    console.log('paypalData', JSON.stringify(paypalData, null, 2));

    if (paypalData.status !== 'COMPLETED') {
      throw appError('付款尚未完成，請稍後再試', HttpStatus.BAD_REQUEST);
    }

    const captureInfo = paypalData.purchase_units?.[0]?.payments?.captures?.[0];
    if (!captureInfo?.id) {
      throw appError('無法取得 PayPal 交易資訊', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { id: paypalTransactionId, custom_id: localOrderId, amount, create_time } = captureInfo;

    const paidAmount = Number(amount?.value ?? 0);
    const paidAt = create_time ? new Date(create_time) : new Date();
    const status = this.mapPaypalStatusToLocalStatus(paypalData.status);
    const orderType = options?.order_type ?? 'room';
    const method = options?.method ?? 'Paypal';

    if (!localOrderId) {
      throw appError('無法取得本地訂單 ID', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const orderData = await this.markOrderAsPaid(user_id, localOrderId, paypalTransactionId);

    await this.paymentService.createPayment(localOrderId, {
      user_id,
      amount: paidAmount,
      gateway_transaction_id: paypalTransactionId,
      net_income: paidAmount,
      status,
      created_at: paidAt,
      updated_at: paidAt,
      order_type: orderType as 'room' | 'subscription',
      method: method,
      fee: 0,
    });

    return orderData;
  }
  mapPaypalStatusToLocalStatus(status: string): 'confirmed' | 'pending' | 'cancelled' {
    switch (status) {
      case 'COMPLETED':
        return 'confirmed';
      case 'PENDING':
        return 'pending';
      default:
        return 'cancelled';
    }
  }

  async createSubscription(subscriptionId: string, userId: string): Promise<PayPalSubscriptionResult> {
    // paypal token
    const token = await createPayPalAccessToken();
    // 訂閱明細
    const orderSubscription = await this.orderSubscriptionRepo.getBySubscriptionIdAndUserId(subscriptionId, userId);
    if (!orderSubscription) {
      throw new Error('無訂閱訂單資料');
    }
    const subscription = await this.subscriptionRepo.getByIdAndUserId(subscriptionId, userId);
    if (!subscription) {
      throw new Error('無訂閱資料');
    }
    let price = 0;
    if (subscription.plan == 'plus') {
      price = 250;
    } else if (subscription.plan == 'pro') {
      price = 500;
    } else {
      throw new Error('無該訂閱方案');
    }

    const res = await paypalApi.post<PayPalCreateOrderResponse>(
      '/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            custom_id: subscriptionId,
            amount: {
              currency_code: 'TWD',
              value: price.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'TWD',
                  value: price.toFixed(2),
                },
              },
            },
            items: [
              {
                name: `subscription-${subscription.plan}`,
                unit_amount: {
                  currency_code: 'TWD',
                  value: price.toFixed(2),
                },
                quantity: '1',
              },
            ],
          },
        ],
        application_context: {
          locale: 'zh-TW',
          return_url: 'https://staymi.vercel.app/',
          cancel_url: 'https://staymi.vercel.app/login',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const { id, links } = res.data;
    const approveLink = links.find((link) => link.rel === 'approve')?.href;

    if (!approveLink) {
      throw new Error('找不到 approve link');
    }

    // await this.orderRoomProductRepo.updatePaypalOrderId(orderId, userId, id);

    return {
      subscriptionId: id,
      approveLink,
    };
  }
}

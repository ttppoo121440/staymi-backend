import {
  PayPalCaptureOrderResponse,
  PayPalCreateOrderResponse,
  PayPalOrderResult,
} from '@/features/paypal/paypal.type';
import { createPayPalAccessToken, paypalApi } from '@/libs/paypalClient';

export class PayPalService {
  async createOrder(): Promise<PayPalOrderResult> {
    const token = await createPayPalAccessToken();

    const res = await paypalApi.post<PayPalCreateOrderResponse>(
      '/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'TWD',
              value: '300.00',
            },
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

    return {
      orderId: id,
      approveLink,
    };
  }

  async captureOrder(orderId: string): Promise<PayPalCaptureOrderResponse> {
    const token = await createPayPalAccessToken();

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
  }
}

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { orderRoomProductCreateSchema, orderRoomProductDto } from '@/features/orderRoomProduct/orderRoomProduct.schema';
import { paypalSchema } from '@/features/paypal/paypal.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

import { bearerSecurity } from '../swagger';

export const registerPaypalRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['Paypal'],
    method: 'post',
    path: '/api/v1/paypal/create-order',
    summary: '建立訂單',
    ...bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: orderRoomProductCreateSchema,
            examples: {
              無伴手禮: {
                summary: '建立訂房訂單範例（無伴手禮）',
                value: {
                  hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                  room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
                  check_in_date: '2025-05-18',
                  check_out_date: '2025-05-20',
                  payment_name: '付款人B',
                  payment_phone: '0922333444',
                  payment_email: 'payer@example.com',
                  contact_name: '聯絡人B',
                  contact_phone: '0922333444',
                  contact_email: 'contact@example.com',
                },
              },
              有伴手禮: {
                summary: '建立訂房訂單範例（有伴手禮）',
                value: {
                  hotel_id: '518a39cd-0018-4263-b51b-fb4bf6612d21',
                  room_plans_id: '4ef6e1ec-0db8-4551-82eb-bec1a0a54a2b',
                  check_in_date: '2025-05-18',
                  check_out_date: '2025-05-19',
                  payment_name: '付款人',
                  payment_phone: '0911222333',
                  payment_email: 'gift@example.com',
                  contact_name: '聯絡人',
                  contact_phone: '0911222333',
                  contact_email: 'gift@example.com',
                  product_plans_id: 'f2093119-4a99-44f4-ad72-0e2dfa19a63b',
                  quantity: 5,
                },
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: '訂房訂單建立成功',
        content: {
          'application/json': {
            schema: orderRoomProductDto,
            examples: {
              'application/json': {
                summary: '取得伴手禮列表成功範例',
                value: {
                  success: true,
                  message: '建立訂單成功',
                  data: {
                    orderId: '0TM5628793670952C',
                    approveLink: 'https://www.sandbox.paypal.com/checkoutnow?token=0TM5628793670952C',
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '缺少必要欄位',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              缺少必要欄位範例: {
                summary: '缺少必要欄位範例',
                value: {
                  message: '請輸入付款人姓名',
                  status: false,
                },
              },
            },
          },
        },
      },
      401: {
        description: '未登入或 token 失效',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '未登入或 token 失效範例',
                value: {
                  message: '未登入或 token 失效',
                  status: false,
                },
              },
            },
          },
        },
      },
      404: {
        description: 'hotel_id 或 room_plans_id 不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'hotel_id 不存在': {
                summary: 'hotel_id 不存在範例',
                value: {
                  message: 'hotel_id 不存在',
                  status: false,
                },
              },
              'room_plans_id 不存在': {
                summary: 'room_plans_id 不存在範例',
                value: {
                  message: 'room_plans_id 不存在',
                  status: false,
                },
              },
            },
          },
        },
      },
      500: {
        description: '伺服器錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '伺服器錯誤範例',
                value: {
                  message: '伺服器發生錯誤，請稍後再試',
                  status: false,
                },
              },
            },
          },
        },
      },
    },
  });

  registry.registerPath({
    tags: ['Paypal'],
    method: 'post',
    path: '/api/v1/paypal/capture-order/{id}',
    summary: '確認付款',
    ...bearerSecurity,
    request: {
      params: z.object({
        token: z.string().openapi({
          description: 'paypal訂單的唯一識別碼token',
          example: '7R327728FS421844A',
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: paypalSchema,
            examples: {
              訂房: {
                summary: '確認付款範例（訂房）',
                value: {
                  order_type: 'room',
                  method: 'Paypal',
                },
              },
              訂閱: {
                summary: '確認付款範例（訂閱）',
                value: {
                  order_type: 'subscription',
                  method: 'Paypal',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: '付款成功成功',
        content: {
          'application/json': {
            schema: orderRoomProductDto,
            examples: {
              'application/json': {
                summary: '付款成功範例',
                value: {
                  success: true,
                  message: '付款成功',
                  data: {
                    payment: {
                      id: 'ac062672-c847-4bc7-951e-f0b0dde61295',
                      user_id: '14233d4e-700b-4d49-b129-02466aa305a0',
                      hotel_id: '561cffc1-85b7-4e3c-9fa7-1e75bd7f9c62',
                      room_plans_id: '4b99c026-408e-4a88-b69b-516d41403199',
                      paypal_order_id: null,
                      paypal_transaction_id: 'CAPTURE_ID',
                      transaction_id: null,
                      check_in_date: '2025-05-21T11:57:30.995Z',
                      check_out_date: '2025-05-23T11:57:30.995Z',
                      total_price: 2000,
                      status: 'confirmed',
                      payment_name: '付款人B',
                      payment_phone: '0922333444',
                      payment_email: 'payer@example.com',
                      contact_name: '聯絡人B',
                      contact_phone: '0922333444',
                      contact_email: 'contact@example.com',
                      created_at: '2025-05-21T11:57:32.802Z',
                      updated_at: '2025-05-21T11:57:32.207Z',
                      hotel_name: '訂單測試商家飯店一號',
                      hotel_region: '台中',
                      hotel_address: '台中市中區自由路一段 123 號',
                      hotel_phone: '0912123123',
                      room_name: 'Standard Room',
                      product_name: null,
                      product_price: null,
                      product_quantity: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '缺少必要欄位',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              缺少必要欄位範例: {
                summary: '缺少必要欄位範例',
                value: {
                  message: '付款方式必填',
                  status: false,
                },
              },
            },
          },
        },
      },
      401: {
        description: '未登入或 token 失效',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '未登入或 token 失效範例',
                value: {
                  message: '未登入或 token 失效',
                  status: false,
                },
              },
            },
          },
        },
      },
      404: {
        description: 'hotel_id 或 room_plans_id 不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'hotel_id 不存在': {
                summary: 'hotel_id 不存在範例',
                value: {
                  message: 'hotel_id 不存在',
                  status: false,
                },
              },
              'room_plans_id 不存在': {
                summary: 'room_plans_id 不存在範例',
                value: {
                  message: 'room_plans_id 不存在',
                  status: false,
                },
              },
            },
          },
        },
      },
      500: {
        description: '伺服器錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '伺服器錯誤範例',
                value: {
                  message: '伺服器發生錯誤，請稍後再試',
                  status: false,
                },
              },
            },
          },
        },
      },
    },
  });
};

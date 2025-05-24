import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { orderRoomProductListDto } from '@/features/orderRoomProduct/orderRoomProduct.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

import { bearerSecurity } from '../swagger';

export const registerOrderRoomProductRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['OrderRoomProduct'],
    method: 'get',
    path: '/api/v1/users/order',
    summary: '取得訂房訂單列表',
    ...bearerSecurity,
    request: {
      query: z.object({
        currentPage: z.number().optional().openapi({
          description: '目前頁數',
          example: 1,
        }),
        perPage: z.number().optional().openapi({
          description: '每頁顯示的資料數量',
          example: 10,
        }),
        status: z.enum(['pending', 'confirmed', 'cancelled']).optional().openapi({
          description: '訂單狀態',
          example: 'pending',
          enumName: 'StatusEnum',
        }),
      }),
    },
    responses: {
      200: {
        description: '取得訂房訂單列表成功',
        content: {
          'application/json': {
            schema: orderRoomProductListDto,
            examples: {
              無伴手禮: {
                summary: '無伴手禮範例',
                value: {
                  success: true,
                  message: '取得訂房訂單列表成功',
                  data: {
                    orders: [
                      {
                        id: '1c48c688-943f-4e1a-9bca-bf6beba5e92f',
                        check_in_date: '2025-05-18',
                        check_out_date: '2025-05-18',
                        total_price: 1000,
                        status: 'pending',
                        payment_name: '測試付款人',
                        payment_phone: '0912345678',
                        payment_email: 'payment_email1747531284593@example.com',
                        contact_name: '測試聯絡人',
                        contact_phone: '0912345678',
                        contact_email: 'contact_email1747531284593@example.com',
                        created_at: '2025-05-18 09:21:24',
                        updated_at: '2025-05-18 09:21:24',
                        order_item: null,
                        hotel_name: '訂單測試商家飯店一號',
                        room_name: 'Standard Room',
                      },
                    ],
                    pagination: {
                      currentPage: 1,
                      perPage: 10,
                      totalPages: 1,
                      totalItems: 1,
                    },
                  },
                },
              },
              有伴手禮: {
                summary: '有伴手禮範例',
                value: {
                  success: true,
                  message: '取得訂房訂單列表成功',
                  data: {
                    orders: [
                      {
                        id: '0f952b24-1e0f-48db-97f5-7a52cccc8e20',
                        check_in_date: '2025-05-18',
                        check_out_date: '2025-05-19',
                        total_price: 8500,
                        status: 'pending',
                        payment_name: '付款人',
                        payment_phone: '0911222333',
                        payment_email: 'gift@example.com',
                        contact_name: '聯絡人',
                        contact_phone: '0911222333',
                        contact_email: 'gift@example.com',
                        created_at: '2025-05-18 09:29:44',
                        updated_at: '2025-05-18 09:29:44',
                        order_item: {
                          id: 'e74a8451-aabe-47a1-bf5c-c1fe355bd01a',
                          quantity: 7,
                          unit_price: 1000,
                          status: 'pending',
                        },
                        hotel_name: '訂單測試商家飯店一號',
                        room_name: 'Standard Room',
                        product_name: '高級伴手禮',
                      },
                      {
                        id: 'e6489f76-00f6-44cc-9f45-d00b4c6e9983',
                        check_in_date: '2025-05-18',
                        check_out_date: '2025-05-18',
                        total_price: 1000,
                        status: 'pending',
                        payment_name: '測試付款人',
                        payment_phone: '0912345678',
                        payment_email: 'payment_email1747531784086@example.com',
                        contact_name: '測試聯絡人',
                        contact_phone: '0912345678',
                        contact_email: 'contact_email1747531784086@example.com',
                        created_at: '2025-05-18 09:29:44',
                        updated_at: '2025-05-18 09:29:44',
                        order_item: null,
                        hotel_name: '訂單測試商家飯店一號',
                        room_name: 'Standard Room',
                      },
                    ],
                    pagination: {
                      currentPage: 1,
                      perPage: 10,
                      totalPages: 1,
                      totalItems: 2,
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '傳入無效的 status',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '傳入無效的 status範例',
                value: {
                  message: '狀態只能是 pending、confirmed、cancelled',
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
    tags: ['OrderRoomProduct'],
    method: 'get',
    path: '/api/v1/users/order/{id}',
    summary: '取得單一訂房訂單',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '訂單的唯一識別碼',
          example: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
        }),
      }),
    },
    responses: {
      200: {
        description: '取得訂房訂單列表成功',
        content: {
          'application/json': {
            schema: orderRoomProductListDto,
            examples: {
              無伴手禮: {
                summary: '無伴手禮範例',
                value: {
                  success: true,
                  message: '取得訂房訂單成功',
                  data: {
                    order: {
                      id: '9952b3e8-2dd0-4277-bc66-265810d68661',
                      check_in_date: '2025-05-18',
                      check_out_date: '2025-05-18',
                      total_price: 1000,
                      status: 'pending',
                      payment_name: '測試付款人',
                      payment_phone: '0912345678',
                      payment_email: 'payment_email1747532011086@example.com',
                      contact_name: '測試聯絡人',
                      contact_phone: '0912345678',
                      contact_email: 'contact_email1747532011086@example.com',
                      created_at: '2025-05-18 09:33:31',
                      updated_at: '2025-05-18 09:33:31',
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
              有伴手禮: {
                summary: '有伴手禮範例',
                value: {
                  success: true,
                  message: '取得訂房訂單成功',
                  data: {
                    order: {
                      id: 'f18ec28f-1bcd-4526-8b33-fe80ea639ecf',
                      check_in_date: '2025-05-18',
                      check_out_date: '2025-05-19',
                      total_price: 8500,
                      status: 'pending',
                      payment_name: '付款人',
                      payment_phone: '0911222333',
                      payment_email: 'gift@example.com',
                      contact_name: '聯絡人',
                      contact_phone: '0911222333',
                      contact_email: 'gift@example.com',
                      created_at: '2025-05-18 09:33:31',
                      updated_at: '2025-05-18 09:33:31',
                      hotel_name: '訂單測試商家飯店一號',
                      hotel_region: '台中',
                      hotel_address: '台中市中區自由路一段 123 號',
                      hotel_phone: '0912123123',
                      room_name: 'Standard Room',
                      product_name: '高級伴手禮',
                      product_price: 1000,
                      product_quantity: 7,
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '傳入無效的 id',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '傳入無效的 id範例',
                value: {
                  message: '請填正確 id 格式',
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
        description: 'order_id 不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '找不到對應的訂房訂單範例',
                value: {
                  message: '找不到對應的訂房訂單',
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

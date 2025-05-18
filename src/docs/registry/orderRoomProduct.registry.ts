import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  orderRoomProductCreateSchema,
  orderRoomProductDto,
  orderRoomProductListDto,
  orderRoomProductUpdateSchema,
} from '@/features/orderRoomProduct/orderRoomProduct.schema';
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

  registry.registerPath({
    tags: ['OrderRoomProduct'],
    method: 'post',
    path: '/api/v1/users/order',
    summary: '建立訂房訂單',
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
                  hotel_id: '13d5e9eb-51b2-404c-995c-2869d60c1248',
                  room_plans_id: 'dd904803-e529-44d2-bd0b-927afd07001d',
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
              無伴手禮: {
                summary: '訂房訂單建立成功範例（無伴手禮）',
                value: {
                  success: true,
                  message: '訂房訂單建立成功',
                  data: {
                    order: {
                      id: 'df0f5224-60ec-4315-b2dc-e199aaa361e7',
                      check_in_date: '2025-05-18',
                      check_out_date: '2025-05-20',
                      total_price: 2000,
                      status: 'pending',
                      payment_name: '付款人B',
                      payment_phone: '0922333444',
                      payment_email: 'payer@example.com',
                      contact_name: '聯絡人B',
                      contact_phone: '0922333444',
                      contact_email: 'contact@example.com',
                      created_at: '2025-05-18 09:48:59',
                      updated_at: '2025-05-18 09:48:59',
                    },
                  },
                },
              },
              有伴手禮: {
                summary: '訂房訂單建立成功範例（有伴手禮）',
                value: {
                  success: true,
                  message: '訂房訂單建立成功',
                  data: {
                    order: {
                      id: '651aa4db-c67d-4dc3-8e53-ea4d875c2d5e',
                      check_in_date: '2025-05-18',
                      check_out_date: '2025-05-19',
                      total_price: 6500,
                      status: 'pending',
                      payment_name: '付款人',
                      payment_phone: '0911222333',
                      payment_email: 'gift@example.com',
                      contact_name: '聯絡人',
                      contact_phone: '0911222333',
                      contact_email: 'gift@example.com',
                      created_at: '2025-05-18 09:45:43',
                      updated_at: '2025-05-18 09:45:43',
                    },
                    order_item: {
                      id: 'a90cebfe-2984-44d5-95b2-82bcd0b48f4d',
                      quantity: 5,
                      unit_price: 1000,
                      status: 'pending',
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
    tags: ['OrderRoomProduct'],
    method: 'put',
    path: '/api/v1/users/order/{id}',
    summary: '訂房訂單狀態更新成功',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '訂單的唯一識別碼',
          example: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: orderRoomProductUpdateSchema,
            examples: {
              'application/json': {
                summary: '訂房訂單狀態更新成功範例',
                value: {
                  status: 'confirmed',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '訂房訂單狀態更新成功',
        content: {
          'application/json': {
            schema: orderRoomProductDto,
            examples: {
              'application/json': {
                summary: '訂房訂單狀態更新成功範例',
                value: {
                  success: true,
                  message: '訂房訂單狀態更新成功',
                  data: {
                    order: {
                      id: '1c219eec-44df-4585-b332-b533f9b5dbfe',
                      check_in_date: '2025-05-18',
                      check_out_date: '2025-05-18',
                      total_price: 1000,
                      status: 'confirmed',
                      payment_name: '測試付款人',
                      payment_phone: '0912345678',
                      payment_email: 'payment_email1747533594642@example.com',
                      contact_name: '測試聯絡人',
                      contact_phone: '0912345678',
                      contact_email: 'contact_email1747533594642@example.com',
                      created_at: '2025-05-18 09:59:54',
                      updated_at: '2025-05-18 09:59:54',
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '缺少 status 欄位',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '缺少 status 欄位範例',
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
      404: {
        description: '找不到對應的訂房訂單',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              找不到對應的訂房訂單: {
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

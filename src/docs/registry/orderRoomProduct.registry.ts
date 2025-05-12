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
              'application/json': {
                summary: '取得訂房訂單列表成功範例',
                value: {
                  success: true,
                  message: '取得訂房訂單列表成功',
                  data: {
                    orders: [
                      {
                        id: 'cbc01c7e-4944-444e-b575-80a09989f906',
                        user_id: 'fea56c48-59ae-42e6-81ea-35f00d84f757',
                        hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                        room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
                        check_in_date: '2025-05-12',
                        check_out_date: '2025-05-12',
                        total_price: 1000,
                        status: 'pending',
                        payment_name: '測試付款人',
                        payment_phone: '0912345678',
                        payment_email: 'payment_email1747047895334@example.com',
                        contact_name: '測試聯絡人',
                        contact_phone: '0912345678',
                        contact_email: 'contact_email1747047895334@example.com',
                        created_at: '2025-05-12 19:04:55',
                        updated_at: '2025-05-12 19:04:55',
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
        description: '取得訂房訂單成功',
        content: {
          'application/json': {
            schema: orderRoomProductDto,
            examples: {
              'application/json': {
                summary: '取得訂房訂單成功範例',
                value: {
                  success: true,
                  message: '取得訂房訂單成功',
                  data: {
                    order: {
                      id: 'df96621e-ca40-4865-8d90-5c2407850e2f',
                      user_id: '55db203e-33a4-4ad1-a33c-2e989b3daf76',
                      hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                      room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
                      check_in_date: '2025-05-12',
                      check_out_date: '2025-05-12',
                      total_price: 1000,
                      status: 'pending',
                      payment_name: '測試付款人',
                      payment_phone: '0912345678',
                      payment_email: 'payment_email1747048445155@example.com',
                      contact_name: '測試聯絡人',
                      contact_phone: '0912345678',
                      contact_email: 'contact_email1747048445155@example.com',
                      created_at: '2025-05-12 19:14:05',
                      updated_at: '2025-05-12 19:14:05',
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
      params: z.object({
        hotel_id: z.string().uuid().openapi({
          description: '飯店的唯一識別碼',
          example: '2d4e0239-766a-4b7b-a38a-2077be3f60ce',
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: orderRoomProductCreateSchema,
            examples: {
              'application/json': {
                summary: '建立訂房訂單範例',
                value: {
                  user_id: '55db203e-33a4-4ad1-a33c-2e989b3daf76',
                  hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                  room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
                  check_in_date: '2025-05-12',
                  check_out_date: '2025-05-12',
                  total_price: 1000,
                  status: 'pending',
                  payment_name: '測試付款人',
                  payment_phone: '0912345678',
                  payment_email: 'payment_email1747048445155@example.com',
                  contact_name: '測試聯絡人',
                  contact_phone: '0912345678',
                  contact_email: 'contact_email1747048445155@example.com',
                  created_at: '2025-05-12 19:14:05',
                  updated_at: '2025-05-12 19:14:05',
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
                summary: '訂房訂單建立成功範例',
                value: {
                  success: true,
                  message: '訂房訂單建立成功',
                  data: {
                    order: {
                      id: '0bc5c81a-76c2-4bc1-8354-fa81667d372b',
                      user_id: '09bc05b5-a6d3-4c18-b7e9-b5d7ba811009',
                      hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                      room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
                      check_in_date: '2025-05-12',
                      check_out_date: '2025-05-14',
                      total_price: 5000,
                      status: 'pending',
                      payment_name: '付款人B',
                      payment_phone: '0922333444',
                      payment_email: 'payer@example.com',
                      contact_name: '聯絡人B',
                      contact_phone: '0922333444',
                      contact_email: 'contact@example.com',
                      created_at: '2025-05-12 19:37:03',
                      updated_at: '1970-01-01 08:00:00',
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
                      id: 'cb4c54c7-8161-4c8d-b4f8-56486e240764',
                      user_id: 'af63c337-f533-4ca1-8fe3-ee8fada0e6e5',
                      hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                      room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
                      check_in_date: '2025-05-12',
                      check_out_date: '2025-05-12',
                      total_price: 1000,
                      status: 'confirmed',
                      payment_name: '測試付款人',
                      payment_phone: '0912345678',
                      payment_email: 'payment_email1747051954393@example.com',
                      contact_name: '測試聯絡人',
                      contact_phone: '0912345678',
                      contact_email: 'contact_email1747051954393@example.com',
                      created_at: '2025-05-12 20:12:34',
                      updated_at: '2025-05-12 20:12:34',
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
        description: 'hotel_id 或 room_plans_id 或 id 不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'id 不存在': {
                summary: 'id 不存在範例',
                value: {
                  message: 'id 不存在',
                  status: false,
                },
              },
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

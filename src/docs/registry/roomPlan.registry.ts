import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  roomPlanCreateSchema,
  roomPlanDto,
  roomPlanListDto,
  roomPlanUpdateSchema,
} from '@/features/roomPlan/roomPlan.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

import { bearerSecurity } from '../swagger';

export const registerRoomPlanRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['RoomPlan'],
    method: 'get',
    path: '/api/v1/store/hotel/room-plan',
    summary: '取得計畫列表-房間',
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
      }),
    },
    responses: {
      200: {
        description: '取得計畫列表成功',
        content: {
          'application/json': {
            schema: roomPlanListDto,
            examples: {
              'application/json': {
                summary: '取得計畫列表成功範例',
                value: {
                  success: true,
                  message: '取得計畫列表成功',
                  data: {
                    roomPlans: [
                      {
                        id: '408133eb-fa31-405c-90f4-d317f1800099',
                        hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                        hotel_room_id: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
                        price: 4999,
                        subscription_price: 4999,
                        images: [],
                        start_date: '2025-06-01',
                        end_date: '2025-08-31',
                        is_active: true,
                        created_at: '2025-05-05 22:58:55',
                        updated_at: '2025-05-05 22:58:55',
                      },
                      {
                        id: '6806ec11-423b-418b-a658-aae2b9173f61',
                        hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                        hotel_room_id: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
                        price: 4999,
                        subscription_price: 2999,
                        images: ['example.jpg'],
                        start_date: '2025-06-01',
                        end_date: '2025-08-31',
                        is_active: true,
                        created_at: '2025-05-06 15:47:36',
                        updated_at: '2025-05-06 15:47:36',
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
      403: {
        description: '無權限訪問此資源',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              '不是 store 身份 範例': {
                summary: '不是 store 身份 範例',
                value: {
                  message: '無權限訪問此資源',
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
    tags: ['RoomPlan'],
    method: 'get',
    path: '/api/v1/store/hotel/room-plan/{id}',
    summary: '取得某一個計畫',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '計畫的唯一識別碼',
          example: '408133eb-fa31-405c-90f4-d317f1800099',
        }),
      }),
    },
    responses: {
      200: {
        description: '取得某一個計畫成功',
        content: {
          'application/json': {
            schema: roomPlanDto,
            examples: {
              'application/json': {
                summary: '取得某一個計畫成功範例',
                value: {
                  success: true,
                  message: '取得計畫資料成功',
                  data: {
                    roomPlan: {
                      id: '408133eb-fa31-405c-90f4-d317f1800099',
                      hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                      hotel_room_id: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
                      price: 4999,
                      subscription_price: 4999,
                      images: [],
                      start_date: '2025-06-01',
                      end_date: '2025-08-31',
                      is_active: true,
                      created_at: '2025-05-05 22:58:55',
                      updated_at: '2025-05-05 22:58:55',
                    },
                  },
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
      403: {
        description: '無權限訪問此資源',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              '不是 store 身份 範例': {
                summary: '不是 store 身份 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              非本人品牌操作範例: {
                summary: '非本人品牌操作範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
            },
          },
        },
      },
      404: {
        description: '計畫不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '計畫不存在範例',
                value: {
                  message: '計畫不存在',
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
    tags: ['RoomPlan'],
    method: 'post',
    path: '/api/v1/store/hotel/room-plan',
    summary: '新增計畫',
    ...bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: roomPlanCreateSchema,
            examples: {
              'application/json': {
                summary: '新增計畫範例',
                value: {
                  hotel_room_id: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
                  price: 4999,
                  subscription_price: 2999,
                  images: ['example.jpg'],
                  start_date: '2025-06-01',
                  end_date: '2025-08-31',
                  is_active: true,
                },
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: '新增計畫成功',
        content: {
          'application/json': {
            schema: roomPlanDto,
            examples: {
              'application/json': {
                summary: '新增計畫成功範例',
                value: {
                  success: true,
                  message: '創建計畫成功',
                  data: {
                    roomPlan: {
                      id: '6806ec11-423b-418b-a658-aae2b9173f61',
                      hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                      hotel_room_id: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
                      price: 4999,
                      subscription_price: 2999,
                      images: ['example.jpg'],
                      start_date: '2025-06-01',
                      end_date: '2025-08-31',
                      is_active: true,
                      created_at: '2025-05-06 15:47:36',
                      updated_at: '2025-05-06 15:47:36',
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '請求錯誤，可能是缺少必要欄位或資料格式不正確',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              缺少必要欄位應回傳範例: {
                summary: '缺少必要欄位應回傳範例',
                value: {
                  success: false,
                  message: '請填寫售價',
                  data: null,
                },
              },
              資料格式不正確範例: {
                summary: '資料格式不正確範例',
                value: {
                  success: false,
                  message: '請使用 YYYY-MM-DD 格式',
                  data: null,
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
      403: {
        description: '無權限訪問此資源',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              '不是 store 身份 範例': {
                summary: '不是 store 身份 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              非本人品牌操作範例: {
                summary: '非本人品牌操作範例',
                value: {
                  message: '無權限訪問此資源',
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
    tags: ['RoomPlan'],
    method: 'put',
    path: '/api/v1/store/hotel/room-plan/{id}',
    summary: '修改計畫',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '計畫的唯一識別碼',
          example: '50be90d8-d19e-4d51-861e-6d02b40be514',
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: roomPlanUpdateSchema,
            examples: {
              'application/json': {
                summary: '修改計畫範例',
                value: {
                  subscription_price: 3888,
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新計畫成功',
        content: {
          'application/json': {
            schema: roomPlanDto,
            examples: {
              'application/json': {
                summary: '更新計畫成功範例',
                value: {
                  success: true,
                  message: '更新計畫成功',
                  data: {
                    roomPlan: {
                      id: '50be90d8-d19e-4d51-861e-6d02b40be514',
                      hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                      hotel_room_id: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
                      price: 4999,
                      subscription_price: 3888,
                      images: [],
                      start_date: '2025-06-01',
                      end_date: '2025-08-31',
                      is_active: true,
                      created_at: '2025-05-06 10:31:57',
                      updated_at: '2025-05-06 10:35:48',
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '請求錯誤，可能是缺少必要欄位或資料格式不正確',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '請求錯誤範例',
                value: {
                  message: '請求錯誤，可能是缺少必要欄位或資料格式不正確',
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
      403: {
        description: '無權限訪問此資源',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              '不是 store 身份 範例': {
                summary: '不是 store 身份 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              非本人品牌操作範例: {
                summary: '非本人品牌操作範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
            },
          },
        },
      },
      404: {
        description: '計畫不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '計畫不存在範例',
                value: {
                  message: '計畫不存在',
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
    tags: ['RoomPlan'],
    method: 'patch',
    path: '/api/v1/store/hotel/room-plan/{id}/active',
    summary: '切換計畫狀態',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '計畫的唯一識別碼',
          example: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
        }),
      }),
    },
    responses: {
      200: {
        description: '計畫狀態切換成功',
        content: {
          'application/json': {
            schema: roomPlanDto,
            examples: {
              'application/json': {
                summary: '狀態切換成功範例',
                value: {
                  success: true,
                  message: '計畫狀態切換成功',
                  data: {
                    roomPlan: {
                      id: '50be90d8-d19e-4d51-861e-6d02b40be514',
                      hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                      hotel_room_id: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
                      price: 4999,
                      subscription_price: 3888,
                      images: [],
                      start_date: '2025-06-01',
                      end_date: '2025-08-31',
                      is_active: false,
                      created_at: '2025-05-06 10:31:57',
                      updated_at: '2025-05-06 10:36:53',
                    },
                  },
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
      403: {
        description: '無權限訪問此資源',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              '不是 store 身份 範例': {
                summary: '不是 store 身份 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              非本人品牌操作範例: {
                summary: '非本人品牌操作範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
            },
          },
        },
      },
      404: {
        description: '計畫不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '計畫不存在範例',
                value: {
                  message: '計畫不存在',
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
    tags: ['RoomPlan'],
    method: 'delete',
    path: '/api/v1/store/hotel/room-plan/{id}',
    summary: '刪除計畫',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '計畫的唯一識別碼',
          example: '408133eb-fa31-405c-90f4-d317f1800099',
        }),
      }),
    },
    responses: {
      200: {
        description: '計畫刪除成功',
        content: {
          'application/json': {
            schema: roomPlanDto,
            examples: {
              'application/json': {
                summary: '刪除成功範例',
                value: {
                  success: true,
                  message: '計畫刪除成功',
                  data: null,
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
      403: {
        description: '無權限訪問此資源',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              '不是 store 身份 範例': {
                summary: '不是 store 身份 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              非本人品牌操作範例: {
                summary: '非本人品牌操作範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
            },
          },
        },
      },
      404: {
        description: '計畫不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '計畫不存在範例',
                value: {
                  message: '計畫不存在',
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
